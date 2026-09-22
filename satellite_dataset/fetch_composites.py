# ============================================================
# M2 STEP 1 - Fetch cloud-free composites from Copernicus (Process API)
# ============================================================
#   python fetch_composites.py --city Indore --years 2020 2022 2024
#   python fetch_composites.py --years 2020 2021 2022 --start-month 1 --end-month 3
#   python fetch_composites.py --city Indore --years 2024 --dry-run
#
# One GeoTIFF per city+year in data/composites/<City>/<year>.tif, in the city's
# UTM zone at 10 m, 8 bands (uint16):
#   B02 B03 B04 B08 B11 B12   reflectance x 10000, per-pixel MEDIAN of clear observations
#   n_clear                    number of clear (cloud-free) observations used
#   n_total                    number of observations with data (clear + cloudy)
# Clouds, shadow, cirrus and saturated pixels are removed per date using the SCL
# band, so a cloudy pixel is filled from another date in the window.

import argparse
import calendar
from datetime import date
from pathlib import Path

import rasterio

from core import (BANDS, END_MONTH, GRID_TILES, MAX_TILE_CLOUD, PROCESS_URL,
                  START_MONTH, STUDY_AREAS, TILE_PX, YEARS, SentinelHub, city_aoi)

COMPOSITE_BANDS = BANDS + ["n_clear", "n_total"]

EVALSCRIPT = """//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02", "B03", "B04", "B08", "B11", "B12", "SCL", "dataMask"] }],
    mosaicking: "ORBIT",
    output: { id: "default", bands: 8, sampleType: "UINT16" }
  };
}
function median(a) {
  a.sort(function (x, y) { return x - y; });
  var m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
function evaluatePixel(samples) {
  var v = [[], [], [], [], [], []], clear = 0, total = 0;
  for (var i = 0; i < samples.length; i++) {
    var s = samples[i];
    if (s.dataMask !== 1) continue;
    total++;
    var c = s.SCL;
    if (c === 0 || c === 1 || c === 3 || c === 8 || c === 9 || c === 10) continue;
    clear++;
    v[0].push(s.B02); v[1].push(s.B03); v[2].push(s.B04);
    v[3].push(s.B08); v[4].push(s.B11); v[5].push(s.B12);
  }
  var out = [];
  for (var k = 0; k < 6; k++) {
    out.push(clear ? Math.max(0, Math.min(65535, Math.round(median(v[k]) * 10000))) : 0);
  }
  out.push(clear);
  out.push(total);
  return out;
}
"""


def build_payload(aoi, start, end, max_cloud):
    return {
        "input": {
            "bounds": {"bbox": [aoi.x_min, aoi.y_min, aoi.x_max, aoi.y_max],
                       "properties": {"crs": f"http://www.opengis.net/def/crs/EPSG/0/{aoi.epsg}"}},
            "data": [{"type": "sentinel-2-l2a",
                      "dataFilter": {"timeRange": {"from": start, "to": end},
                                     "maxCloudCoverage": max_cloud}}],
        },
        "output": {"width": aoi.px, "height": aoi.px,
                   "responses": [{"identifier": "default", "format": {"type": "image/tiff"}}]},
        "evalscript": EVALSCRIPT,
    }


def verify_and_tag(path, aoi, tags):
    """Check the API returned exactly the grid we asked for, then label the bands."""
    with rasterio.open(path, "r+") as d:
        problems = []
        if d.count != 8:
            problems.append(f"{d.count} bands, expected 8")
        if (d.width, d.height) != (aoi.px, aoi.px):
            problems.append(f"size {d.width}x{d.height}, expected {aoi.px}x{aoi.px}")
        if d.crs is None or d.crs.to_epsg() != aoi.epsg:
            problems.append(f"CRS {d.crs}, expected EPSG:{aoi.epsg}")
        if abs(d.transform.c - aoi.x_min) > 1 or abs(d.transform.f - aoi.y_max) > 1:
            problems.append("origin does not match the AOI grid")
        if problems:
            raise RuntimeError("; ".join(problems))
        for i, name in enumerate(COMPOSITE_BANDS, start=1):
            d.set_band_description(i, name)
        d.update_tags(**tags)


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--city", nargs="+", choices=list(STUDY_AREAS), help="one or more; default: all cities")
    p.add_argument("--years", type=int, nargs="+", default=YEARS)
    p.add_argument("--start-month", type=int, default=START_MONTH)
    p.add_argument("--end-month", type=int, default=END_MONTH)
    p.add_argument("--max-cloud", type=int, default=MAX_TILE_CLOUD,
                   help="skip dates with more whole-tile cloud %% (default from config)")
    p.add_argument("--grid-tiles", type=int, default=GRID_TILES)
    p.add_argument("--out", default="data/composites")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if not 1 <= args.start_month <= args.end_month <= 12:
        raise SystemExit("Need 1 <= start-month <= end-month <= 12 (window within one year).")
    if args.grid_tiles * TILE_PX > 2500:
        raise SystemExit("Process API limit is 2500 px per side; reduce --grid-tiles.")

    cities = args.city or list(STUDY_AREAS)
    hub = None if args.dry_run else SentinelHub()

    for city in cities:
        aoi = city_aoi(city, args.grid_tiles)
        for year in args.years:
            start = f"{year}-{args.start_month:02d}-01"
            last = calendar.monthrange(year, args.end_month)[1]
            end = f"{year}-{args.end_month:02d}-{last:02d}"
            if date(year, args.start_month, 1) > date.today():
                print(f"{city} {year}: window is in the future, skipping")
                continue
            out = Path(args.out) / city / f"{year}.tif"
            if out.exists():
                print(f"{city} {year}: exists, skipping")
                continue
            if args.dry_run:
                print(f"[dry-run] {city} {year}: {start}..{end}  EPSG:{aoi.epsg}  "
                      f"{aoi.px}x{aoi.px} px  bbox=({aoi.x_min:.0f},{aoi.y_min:.0f},"
                      f"{aoi.x_max:.0f},{aoi.y_max:.0f})")
                continue
            try:
                resp = hub.post(PROCESS_URL, build_payload(
                    aoi, f"{start}T00:00:00Z", f"{end}T23:59:59Z", args.max_cloud),
                    accept="image/tiff")
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(resp.content)
                verify_and_tag(out, aoi, {
                    "city": city, "year": str(year), "window_start": start, "window_end": end,
                    "source": "Sentinel-2 L2A (Copernicus Data Space, Sentinel Hub Process API)",
                    "method": "per-pixel median of SCL-clear observations",
                    "scale": "reflectance x 10000"})
                print(f"{city} {year}: saved {out}")
            except Exception as e:
                out.unlink(missing_ok=True)
                print(f"{city} {year}: FAILED - {e}")


if __name__ == "__main__":
    main()

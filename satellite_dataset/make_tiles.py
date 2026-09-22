# ============================================================
# M2 STEP 2 - Tile composites, build metadata, prepare ready-to-use data
# ============================================================
#   python make_tiles.py                              # all composites in data/composites
#   python make_tiles.py --min-valid 0.9 --force
#   python make_tiles.py --input raw/2022/IND_2022_001.tif --city Indore --year 2022 --dn-offset 1000
#
# Output (dataset/):
#   tiles/<City>/<year>/<tile_id>.tif   uint16 GeoTIFF: B02 B03 B04 B08 B11 B12 + valid mask
#   metadata/tiles.gpkg                 GeoPackage: layers `tiles` (footprints + attributes) and `aois`
#   metadata/tiles.csv                  same attributes, footprint as WKT
#   metadata/pairs.csv                  tile pairs across years for change analysis (with index deltas)
#   metadata/stats.json                 per-band mean/std for model normalisation
#   quicklooks/<City>_<year>.png        RGB + NDVI overview of each composite
#
# tile_id = <City>_r<row>_c<col>. With composites from fetch_composites.py the
# grid is identical every year, so the same tile_id is the same ground in every year.

import argparse
import json
import re
from itertools import combinations
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
import rasterio
from pyproj import Transformer
from rasterio.windows import Window, transform as window_transform
from shapely.geometry import Polygon, box
from shapely.ops import transform as shp_transform

from core import BANDS, REFLECTANCE_SCALE, TILE_PX

OUT_BANDS = BANDS + ["valid"]


def canonical(desc):
    """'Red_B04' / 'B04' -> 'B04'; other descriptions (n_clear, ...) -> as-is."""
    m = re.search(r"B(\d{2})A?$", desc or "")
    return f"B{m.group(1)}" if m else desc


def norm_diff(a, b):
    with np.errstate(divide="ignore", invalid="ignore"):
        return (a - b) / (a + b)


class StatsAccumulator:
    def __init__(self):
        self.n, self.s, self.ss = {}, {}, {}

    def add(self, band, values):
        v = values.astype("float64")
        self.n[band] = self.n.get(band, 0) + v.size
        self.s[band] = self.s.get(band, 0.0) + v.sum()
        self.ss[band] = self.ss.get(band, 0.0) + (v ** 2).sum()

    def result(self):
        bands = [b for b in BANDS if b in self.n]
        mean = {b: self.s[b] / self.n[b] for b in bands}
        std = {b: float(np.sqrt(max(self.ss[b] / self.n[b] - mean[b] ** 2, 0))) for b in bands}
        return {"bands": bands, "unit": "reflectance (0-1)", "scale_in_files": REFLECTANCE_SCALE,
                "mean": mean, "std": std, "n_pixels": {b: int(self.n[b]) for b in bands}}


def tile_one(path, city, year, tags, args, acc, quicklook_dir, out_root):
    rows = []
    with rasterio.open(path) as src:
        names = [canonical(d) for d in src.descriptions]
        idx = {n: i for i, n in enumerate(names) if n}
        present = [b for b in BANDS if b in idx]
        if not {"B02", "B03", "B04", "B08"} <= set(present):
            raise SystemExit(f"{path}: needs at least B02,B03,B04,B08 in band descriptions, got {names}")

        epsg = src.crs.to_epsg()
        to_wgs = Transformer.from_crs(src.crs, 4326, always_xy=True).transform
        n_rows, n_cols = src.height // TILE_PX, src.width // TILE_PX
        dropped_edge = (src.height % TILE_PX > 0) + (src.width % TILE_PX > 0)
        data = src.read().astype("float32")                        # (bands, H, W)
        transform = src.transform

    refl_dn = np.stack([np.clip(data[idx[b]] - args.dn_offset, 0, None) for b in present])
    if "n_clear" in idx:
        valid_px = data[idx["n_clear"]] > 0
    else:
        valid_px = (data[[idx[b] for b in ("B02", "B03", "B04", "B08")]] > 0).all(axis=0)
    n_clear = data[idx["n_clear"]] if "n_clear" in idx else None
    n_total = data[idx["n_total"]] if "n_total" in idx else None

    tile_dir = out_root / "tiles" / city / str(year)
    tile_dir.mkdir(parents=True, exist_ok=True)

    for r in range(n_rows):
        for c in range(n_cols):
            sl = (slice(r * TILE_PX, (r + 1) * TILE_PX), slice(c * TILE_PX, (c + 1) * TILE_PX))
            v = valid_px[sl]
            valid_frac = float(v.mean())
            refl = refl_dn[(slice(None),) + sl] / REFLECTANCE_SCALE
            win = Window(c * TILE_PX, r * TILE_PX, TILE_PX, TILE_PX)
            t = window_transform(win, transform)
            x0, y0 = t.c, t.f                      # top-left
            x1, y1 = x0 + TILE_PX * t.a, y0 + TILE_PX * t.e
            footprint = shp_transform(to_wgs, box(x0, y1, x1, y0))

            def band(b):
                return refl[present.index(b)] if b in present else None

            def mean_of(a):
                return float(np.nanmean(np.where(v, a, np.nan))) if v.any() and a is not None else np.nan

            ndvi = norm_diff(band("B08"), band("B04"))
            ndbi = norm_diff(band("B11"), band("B08")) if "B11" in present else None
            mndwi = norm_diff(band("B03"), band("B11")) if "B11" in present else None
            tile_id = f"{city}_r{r:02d}_c{c:02d}"
            tile_path = tile_dir / f"{tile_id}.tif"
            keep = valid_frac >= args.min_valid

            if keep:
                if args.force or not tile_path.exists():
                    out = np.zeros((len(OUT_BANDS), TILE_PX, TILE_PX), dtype="uint16")
                    for i, b in enumerate(BANDS):
                        if b in present:
                            out[i] = np.where(v, refl_dn[(present.index(b),) + sl], 0).astype("uint16")
                    out[-1] = v.astype("uint16")
                    with rasterio.open(tile_path, "w", driver="GTiff", height=TILE_PX, width=TILE_PX,
                                       count=len(OUT_BANDS), dtype="uint16", crs=f"EPSG:{epsg}",
                                       transform=t, nodata=0, compress="deflate") as dst:
                        dst.write(out)
                        for i, b in enumerate(OUT_BANDS, start=1):
                            dst.set_band_description(i, b)
                        dst.update_tags(tile_id=tile_id, city=city, year=str(year),
                                        scale=f"reflectance x {REFLECTANCE_SCALE}; 'valid' band is 1/0",
                                        **{k: v_ for k, v_ in tags.items()
                                           if k in ("window_start", "window_end", "source", "method")})
                for b in present:
                    acc.add(b, refl[present.index(b)][v])

            rows.append({
                "tile_id": tile_id, "city": city, "year": year, "row": r, "col": c,
                "window_start": tags.get("window_start"), "window_end": tags.get("window_end"),
                "epsg": epsg, "x_min": x0, "y_min": y1, "x_max": x1, "y_max": y0,
                "lon_c": footprint.centroid.x, "lat_c": footprint.centroid.y,
                "valid_frac": round(valid_frac, 4),
                "clear_obs_mean": float(n_clear[sl].mean()) if n_clear is not None else np.nan,
                "cloudy_obs_frac": (float(1 - n_clear[sl].sum() / n_total[sl].sum())
                                    if n_total is not None and n_total[sl].sum() > 0 else np.nan),
                "ndvi_mean": mean_of(ndvi), "ndbi_mean": mean_of(ndbi), "mndwi_mean": mean_of(mndwi),
                "brightness": mean_of((band("B02") + band("B03") + band("B04")) / 3),
                "keep": keep,
                "path": str(tile_path.relative_to(out_root)) if keep else None,
                "geometry": footprint,
            })

    save_quicklook(refl_dn, present, valid_px, quicklook_dir / f"{city}_{year}.png", f"{city} {year}")
    print(f"{city} {year}: {n_rows}x{n_cols} tiles ({sum(r['keep'] for r in rows)} kept, "
          f"min valid {args.min_valid:.0%})"
          + (f"; {dropped_edge} partial edge strip(s) dropped" if dropped_edge else ""))
    return rows, (src_signature(path))


def src_signature(path):
    with rasterio.open(path) as s:
        return (s.crs.to_epsg(), s.transform.to_gdal(), s.width, s.height)


def aoi_layer(jobs):
    """One footprint per city, taken from the real composite bounds (WGS84)."""
    rows, seen = [], set()
    for path, city, year, _ in jobs:
        if city in seen:
            continue
        seen.add(city)
        with rasterio.open(path) as s:
            b, epsg = s.bounds, s.crs.to_epsg()
        t = Transformer.from_crs(epsg, 4326, always_xy=True).transform
        poly = shp_transform(t, box(b.left, b.bottom, b.right, b.top))
        rows.append({"city": city, "epsg": epsg, "x_min": b.left, "y_min": b.bottom,
                     "x_max": b.right, "y_max": b.top, "geometry": Polygon(poly.exterior)})
    return gpd.GeoDataFrame(rows, geometry="geometry", crs=4326)


def save_quicklook(refl_dn, present, valid, path, title):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    step = max(1, refl_dn.shape[1] // 700)
    g = lambda b: refl_dn[present.index(b)][::step, ::step] / REFLECTANCE_SCALE
    v = valid[::step, ::step]
    rgb = np.stack([g("B04"), g("B03"), g("B02")], axis=-1)
    for i in range(3):
        lo, hi = np.percentile(rgb[..., i][v], (2, 98)) if v.any() else (0, 1)
        rgb[..., i] = np.clip((rgb[..., i] - lo) / max(hi - lo, 1e-6), 0, 1)
    rgb[~v] = 0.85
    ndvi = np.where(v, norm_diff(g("B08"), g("B04")), np.nan)
    fig, ax = plt.subplots(1, 2, figsize=(12, 5.5))
    ax[0].imshow(rgb); ax[0].set_title("True colour")
    im = ax[1].imshow(ndvi, cmap="RdYlGn", vmin=-0.2, vmax=0.9); ax[1].set_title("NDVI")
    fig.colorbar(im, ax=ax[1], fraction=0.046)
    for a in ax:
        a.axis("off")
    fig.suptitle(title); fig.tight_layout()
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=110); plt.close(fig)


def build_pairs(df):
    """All (earlier, later) year pairs per tile where both years are kept."""
    keep = df[df["keep"]]
    out = []
    for (city, tile_id), g in keep.groupby(["city", "tile_id"]):
        g = g.sort_values("year")
        for a, b in combinations(g.itertuples(index=False), 2):
            out.append({
                "city": city, "tile_id": tile_id, "year_a": a.year, "year_b": b.year,
                "path_a": a.path, "path_b": b.path,
                "ndvi_delta": b.ndvi_mean - a.ndvi_mean,
                "ndbi_delta": b.ndbi_mean - a.ndbi_mean,
                "mndwi_delta": b.mndwi_mean - a.mndwi_mean,
                "valid_frac_min": min(a.valid_frac, b.valid_frac),
            })
    return pd.DataFrame(out)


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--composites", default="data/composites")
    p.add_argument("--out", default="dataset")
    p.add_argument("--input", help="a single GeoTIFF instead of scanning --composites")
    p.add_argument("--city"); p.add_argument("--year", type=int)
    p.add_argument("--min-valid", type=float, default=0.8,
                   help="keep tiles with at least this fraction of clear pixels (default 0.8)")
    p.add_argument("--dn-offset", type=int, default=0,
                   help="subtract from raw DN first (1000 for raw L2A products with baseline >= 04.00)")
    p.add_argument("--force", action="store_true", help="rewrite existing tile files")
    args = p.parse_args()

    out_root = Path(args.out)
    if args.input:
        if not (args.city and args.year):
            raise SystemExit("--input needs --city and --year")
        jobs = [(Path(args.input), args.city, args.year, {})]
    else:
        jobs = []
        for tif in sorted(Path(args.composites).glob("*/*.tif")):
            with rasterio.open(tif) as s:
                tags = s.tags()
            jobs.append((tif, tif.parent.name, int(tags.get("year", tif.stem)), tags))
    if not jobs:
        raise SystemExit("No composites found. Run fetch_composites.py first.")

    print(f"rasterio {rasterio.__version__} / GDAL {rasterio.__gdal_version__}")
    acc, all_rows, grids = StatsAccumulator(), [], {}
    for path, city, year, tags in jobs:
        rows, sig = tile_one(path, city, year, tags, args, acc, out_root / "quicklooks", out_root)
        all_rows += rows
        grids.setdefault(city, {})[year] = sig

    # Multi-temporal sanity check: every year of a city must share one pixel grid.
    for city, years in grids.items():
        if len(set(years.values())) > 1:
            print(f"WARNING {city}: years are NOT on the same grid; tile ids won't line up: {sorted(years)}")
        elif len(years) > 1:
            print(f"{city}: {len(years)} years share an identical grid (OK for change analysis)")

    df = gpd.GeoDataFrame(all_rows, geometry="geometry", crs=4326)
    scenes_csv = out_root / "metadata" / "scenes.csv"
    if scenes_csv.exists():           # written by search_scenes.py
        sc = pd.read_csv(scenes_csv)
        prov = sc.groupby(["city", "year"]).agg(
            n_acquisitions=("date", "nunique"),
            scene_cloud_median=("cloud_cover", "median")).reset_index()
        df = df.merge(prov, on=["city", "year"], how="left")
        print(f"joined scene provenance from {scenes_csv}")
    meta = out_root / "metadata"
    meta.mkdir(parents=True, exist_ok=True)
    df.to_file(meta / "tiles.gpkg", layer="tiles", driver="GPKG")
    aoi_layer(jobs).to_file(meta / "tiles.gpkg", layer="aois", driver="GPKG")
    pd.DataFrame(df.assign(footprint_wkt=df.geometry.to_wkt()).drop(columns="geometry")) \
        .to_csv(meta / "tiles.csv", index=False)
    pairs = build_pairs(pd.DataFrame(df.drop(columns="geometry")))
    pairs.to_csv(meta / "pairs.csv", index=False)
    (meta / "stats.json").write_text(json.dumps(acc.result(), indent=2))

    print(f"\n{int(df['keep'].sum())}/{len(df)} tiles kept -> {out_root}/tiles")
    print(f"{len(pairs)} multi-temporal tile pairs -> {meta / 'pairs.csv'}")
    print(f"metadata -> {meta}/tiles.gpkg, tiles.csv, stats.json")


if __name__ == "__main__":
    main()

# ============================================================
# M2 - Satellite Data + Preprocessing
# STEP 0: Sentinel-2 scene search per city and year (provenance metadata)
# ============================================================
# Adapted from the original satellite_search.py. Instead of searching all of
# India, it searches each city's fixed AOI for the same date window and cloud
# limit that fetch_composites.py uses, so scenes.csv lists exactly which
# acquisitions fed each composite.
#
#   python search_scenes.py                               # all cities, all years
#   python search_scenes.py --city Indore --years 2022 2024
#
# Writes dataset/metadata/scenes.csv. make_tiles.py picks it up automatically and
# adds n_acquisitions / scene_cloud_median to every tile's metadata.
#
# Install once if required:  pip install pystac-client pandas

import argparse
import calendar
from pathlib import Path

import pandas as pd
from pystac_client import Client

from core import END_MONTH, MAX_TILE_CLOUD, START_MONTH, STUDY_AREAS, YEARS, aoi_bbox_wgs84, city_aoi

# ============================================================
# 1. CONNECT TO COPERNICUS DATA SPACE STAC API
# ============================================================
STAC_URL = "https://stac.dataspace.copernicus.eu/v1"


def search_city_year(catalog, bbox, start, end, max_cloud, max_items):
    """Sentinel-2 L2A items over the AOI in the window, cloud-filtered."""
    search = catalog.search(
        collections=["sentinel-2-l2a"],
        bbox=bbox,
        datetime=f"{start}T00:00:00Z/{end}T23:59:59Z",
        query={"eo:cloud_cover": {"lte": max_cloud}},
        max_items=max_items,
    )
    return list(search.items())


def items_to_rows(items, city, year, start, end):
    rows = []
    for item in items:
        p = item.properties
        rows.append({
            "city": city, "year": year,
            "window_start": start, "window_end": end,
            "tile_id": item.id,                        # Sentinel-2 product id
            "date": item.datetime,                     # acquisition date/time
            "cloud_cover": p.get("eo:cloud_cover"),    # whole-tile cloud %
            "satellite": p.get("platform"),
            "collection": item.collection_id,
            "bbox": item.bbox,
        })
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--city", nargs="+", choices=list(STUDY_AREAS), help="default: all cities")
    ap.add_argument("--years", type=int, nargs="+", default=YEARS)
    ap.add_argument("--start-month", type=int, default=START_MONTH)
    ap.add_argument("--end-month", type=int, default=END_MONTH)
    ap.add_argument("--max-cloud", type=float, default=MAX_TILE_CLOUD)
    ap.add_argument("--max-items", type=int, default=300)
    ap.add_argument("--out", default="dataset/metadata/scenes.csv")
    args = ap.parse_args()

    catalog = Client.open(STAC_URL)
    print("Connected to Copernicus Data Space STAC API\n")

    rows = []
    for city in args.city or list(STUDY_AREAS):
        bbox = aoi_bbox_wgs84(city_aoi(city))
        for year in args.years:
            start = f"{year}-{args.start_month:02d}-01"
            end = f"{year}-{args.end_month:02d}-{calendar.monthrange(year, args.end_month)[1]:02d}"
            try:
                items = search_city_year(catalog, bbox, start, end, args.max_cloud, args.max_items)
            except Exception as e:
                print(f"{city} {year}: search failed ({e})")
                continue
            print(f"{city:<10} {year}: {len(items):>3} scene items")
            rows += items_to_rows(items, city, year, start, end)

    df = pd.DataFrame(rows)
    if df.empty:
        print("\nNo matching images found. Try a higher --max-cloud or a different window.")
        return
    df = df.sort_values(["city", "year", "date"]).reset_index(drop=True)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(args.out, index=False)

    print("\n===================================================")
    print("SENTINEL-2 SCENES USED PER COMPOSITE")
    print("===================================================")
    summary = df.groupby(["city", "year"]).agg(
        acquisitions=("date", "nunique"),
        cloud_median=("cloud_cover", "median"),
        first=("date", "min"), last=("date", "max"))
    summary["cloud_median"] = summary["cloud_median"].round(1)
    print(summary.to_string())
    print(f"\nSaved {len(df)} rows to {args.out}")


if __name__ == "__main__":
    main()

"""
Core module for the M2 satellite dataset pipeline: settings, the per-city AOI
grid, and the Copernicus (Sentinel Hub) API client. search_scenes.py,
fetch_composites.py and make_tiles.py all import from this one file.
"""

import os
import time
from dataclasses import dataclass

import requests
from dotenv import load_dotenv
from pyproj import Transformer

# ============================================================
# Settings
# ============================================================

STUDY_AREAS = {                       # (lat, lon) of city centre
    "Indore": (22.7196, 75.8577),
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bengaluru": (12.9716, 77.5946),
    "Ahmedabad": (23.0225, 72.5714),
}
YEARS = list(range(2020, 2027))

RES_M = 10          # metres per pixel (Sentinel-2 native for B02/B03/B04/B08)
TILE_PX = 256       # tile edge in pixels  -> 2.56 km
GRID_TILES = 8      # AOI = GRID_TILES x GRID_TILES tiles -> 20.48 km square, 2048 px
                    # (the Process API allows at most 2500 px per side)

BANDS = ["B02", "B03", "B04", "B08", "B11", "B12"]   # Blue Green Red NIR SWIR1 SWIR2
REFLECTANCE_SCALE = 10000                            # stored as uint16 = reflectance * 10000

# Composite window and cloud limit. fetch_composites.py and search_scenes.py both
# read these, so the scene list always matches what went into the composites.
START_MONTH = 1     # Jan-Mar: dry season, far fewer clouds than the monsoon
END_MONTH = 3
MAX_TILE_CLOUD = 80  # skip whole acquisitions with more than this % cloud


# ============================================================
# AOI (Area of Interest): a fixed, UTM-aligned box per city
# ============================================================
# The AOI is a square of GRID_TILES x GRID_TILES tiles, snapped to the 10 m
# pixel grid, in the city's UTM zone. Because the box is deterministic, every
# year is requested on the *identical* pixel grid, so tile (row, col) covers
# the same ground in every year. That is what makes multi-temporal comparison
# possible.

@dataclass(frozen=True)
class AOI:
    city: str
    epsg: int
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    px: int          # pixels per side


def utm_epsg(lon, lat):
    zone = int((lon + 180) // 6) + 1
    return (32600 if lat >= 0 else 32700) + zone


def city_aoi(city, grid_tiles=GRID_TILES, tile_px=TILE_PX, res=RES_M):
    lat, lon = STUDY_AREAS[city]
    epsg = utm_epsg(lon, lat)
    cx, cy = Transformer.from_crs(4326, epsg, always_xy=True).transform(lon, lat)
    px = grid_tiles * tile_px
    size = px * res
    x0 = round((cx - size / 2) / res) * res       # snap to the 10 m grid
    y0 = round((cy - size / 2) / res) * res
    return AOI(city, epsg, x0, y0, x0 + size, y0 + size, px)


def aoi_bbox_wgs84(aoi):
    """[west, south, east, north] in lon/lat covering the AOI (for STAC searches)."""
    t = Transformer.from_crs(aoi.epsg, 4326, always_xy=True)
    pts = [t.transform(x, y) for x, y in [(aoi.x_min, aoi.y_min), (aoi.x_max, aoi.y_min),
                                          (aoi.x_max, aoi.y_max), (aoi.x_min, aoi.y_max)]]
    lons, lats = zip(*pts)
    return [min(lons), min(lats), max(lons), max(lats)]


# ============================================================
# Copernicus / Sentinel Hub API client
# ============================================================
# OAuth client-credentials login (CDSE_CLIENT_ID / CDSE_CLIENT_SECRET in .env),
# NOT your normal Copernicus username/password.

TOKEN_URL = ("https://identity.dataspace.copernicus.eu/"
             "auth/realms/CDSE/protocol/openid-connect/token")
PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"


class SentinelHub:
    def __init__(self):
        load_dotenv()
        self.client_id = os.getenv("CDSE_CLIENT_ID")
        self.client_secret = os.getenv("CDSE_CLIENT_SECRET")
        if not self.client_id or not self.client_secret:
            raise SystemExit("Set CDSE_CLIENT_ID and CDSE_CLIENT_SECRET in .env (see .env.example).")
        self._token, self._expires_at = None, 0.0

    def _auth_header(self):
        if time.time() >= self._expires_at:
            r = requests.post(TOKEN_URL, timeout=60, data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret})
            if r.status_code != 200:
                raise SystemExit(f"Authentication failed ({r.status_code}): {r.text[:300]}")
            data = r.json()
            self._token = data["access_token"]
            self._expires_at = time.time() + int(data.get("expires_in", 600)) - 60
        return {"Authorization": f"Bearer {self._token}"}

    def post(self, url, payload, accept="application/json", retries=4):
        for attempt in range(1, retries + 1):
            r = requests.post(url, json=payload, timeout=600,
                              headers={**self._auth_header(), "Accept": accept})
            if r.status_code == 401:
                self._expires_at = 0.0
                continue
            if r.status_code == 429 or r.status_code >= 500:
                wait = float(r.headers.get("Retry-After", 2 ** attempt))
                print(f"  HTTP {r.status_code}, retrying in {wait:.0f}s")
                time.sleep(wait)
                continue
            if r.status_code != 200:
                raise RuntimeError(f"HTTP {r.status_code}: {r.text[:600]}")
            return r
        raise RuntimeError("request kept failing after retries")

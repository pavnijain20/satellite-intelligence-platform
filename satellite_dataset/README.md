# M2 Satellite Data – Simple Guide to Every File

**Project:** Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery
**Your part (Member 2):** get the satellite data, clean it, cut it into tiles, add metadata, and give the team ready-to-use data.

This guide explains every file in easy words: what it is, what goes in, what comes out.

> **Honest note:** the scripts were tested with real data from your `IND_2022_001.tif` and with a *fake* Copernicus server. They were **not** run against the real Copernicus website (my tools could not reach it). Run the small `--dry-run` checks first, then one city and one year, before running everything.

---

## 1. The big idea (in 5 lines)

1. Copernicus has years of Sentinel-2 satellite photos.
2. We ask Copernicus for **one clean picture per city per year**, made from many photos, with clouds removed.
3. Every year uses the **exact same pixel grid**, so the same square on the ground is in the same place every year.
4. We cut each picture into small **256 × 256 pixel tiles**.
5. We save **metadata** (a table describing every tile) so teammates can search tiles and compare years.

---

## 2. Which folder should I use?

I made three folders over our conversation. **Use only `m2_pipeline`** for your main work.

| Folder | What it is | Use it? |
|---|---|---|
| **`m2_pipeline/`** | The full final pipeline: search → fetch → tile → metadata | **Yes – this is the main one** |
| `projects_api/` | Quick numbers only (average NDVI per city per year) | Optional, handy for a quick look |
| `projects/` | First attempt: downloads whole big satellite files | No – replaced by `m2_pipeline` |

---

## 3. Order to run things (in `m2_pipeline`)

```
pip install -r requirements.txt          (once)
copy .env.example to .env and fill it    (once)

python search_scenes.py                  step 1: which satellite passes are used?
python fetch_composites.py               step 2: get the clean city pictures
python make_tiles.py                     step 3: cut into tiles + make metadata
```

**Try small first:**
```
python fetch_composites.py --city Indore --years 2022 --dry-run    (shows the plan, costs nothing)
python fetch_composites.py --city Indore --years 2022              (one real picture)
python make_tiles.py
```

---

## 4. The files in `m2_pipeline/`

### `.env.example` → you copy it to `.env`
Holds your Copernicus login keys. Two lines:
```
CDSE_CLIENT_ID=...
CDSE_CLIENT_SECRET=...
```
Get them from the Copernicus Dashboard → User Settings → OAuth clients.
These are **not** your normal username and password.
**Never share your `.env` file.**

### `requirements.txt`
The list of Python packages to install (`rasterio`, `geopandas`, `shapely`, `pyproj`, `pandas`, etc.). Install with `pip install -r requirements.txt`.

### `core.py` — settings, city boxes, and the Copernicus login helper (all in one file)
This one file holds three things, kept together to keep the project small for GitHub:
1. **Settings** (same as before) — change numbers here, not inside other files.
2. **AOI code** — draws the box for each city.
3. **API client** — logs in to Copernicus and talks to it.

**Settings table:**

| Setting | Value | Meaning |
|---|---|---|
| `STUDY_AREAS` | 5 cities | Indore, Mumbai, Delhi, Bengaluru, Ahmedabad (their centre points) |
| `YEARS` | 2020–2026 | Years to collect |
| `RES_M` | 10 | Each pixel = 10 m × 10 m on the ground |
| `TILE_PX` | 256 | Each tile is 256 × 256 pixels (2.56 km wide) |
| `GRID_TILES` | 8 | City area = 8 × 8 = 64 tiles (20.48 km × 20.48 km) |
| `BANDS` | B02, B03, B04, B08, B11, B12 | Blue, Green, Red, Near-infrared, two Short-wave infrared |
| `START_MONTH`, `END_MONTH` | 1 and 3 | Use photos from Jan–Mar of each year |
| `MAX_TILE_CLOUD` | 80 | Skip whole photos that are more than 80% cloudy |

> **Why Jan–Mar?** July is monsoon and very cloudy in India. Jan–Mar gives much cleaner pictures. If your team wants July, set both months to 7.

**AOI part of `core.py`:** "AOI" = Area Of Interest. It uses **PyProj** to convert the city's latitude/longitude into UTM meters (zone 43 for all your cities), then draws a square box around the city, snapped to the 10 m pixel grid. Because the box is always the same, **every year lines up perfectly** — this is the key to comparing years.

**API client part of `core.py`:** logs in with your keys, keeps the login fresh (it expires every ~10 minutes), and retries if the server is busy.

### `search_scenes.py` — Step 1: which satellite passes are used?
*(This is your original `satellite_search.py`, upgraded.)*
- **Does:** searches the Copernicus catalogue for each city and year, using the same dates and cloud limit as the fetch step.
- **Run:** `python search_scenes.py --city Indore --years 2022 2024`
- **Makes:** `dataset/metadata/scenes.csv` – a list of every satellite pass (id, date, cloud %, satellite).
- **Why:** it records *which passes* built each picture. Later this adds `n_acquisitions` (number of passes used) to every tile. More passes = more trustworthy picture.
- **Note:** "cloud_cover" here is for the whole big ~110 km photo, not just your city.

### `fetch_composites.py` — Step 2: get the clean city pictures
- **Does:** asks Copernicus (Sentinel Hub Process API) for one picture per city per year. For each pixel it takes the **middle value (median) of all cloud-free views**. Clouds, cloud shadows and thin cirrus are removed using Sentinel-2's own label layer (SCL). A cloudy pixel gets filled from another date.
- **Run:** `python fetch_composites.py --city Indore --years 2020 2022 2024` (add `--dry-run` to only preview)
- **Makes:** `data/composites/<City>/<year>.tif`
- **Each file has 8 layers (bands):**

| # | Band | Meaning |
|---|---|---|
| 1–6 | B02 B03 B04 B08 B11 B12 | Light values, stored as **reflectance × 10000** |
| 7 | n_clear | How many cloud-free views were used for this pixel |
| 8 | n_total | How many views existed (clear + cloudy) |

- **Safety check:** after saving, it confirms the file has the right size, map system and position. If not, it deletes the file and tells you.
- It skips files that already exist, so you can re-run safely.
- Uses your Copernicus **processing quota**, so use `--dry-run` first.

### `make_tiles.py` — Step 3: cut into tiles and make metadata (the main product)
- **Does:** cuts each picture into 256 × 256 tiles, checks quality, calculates numbers, and writes everything to `dataset/`.
- **Run:** `python make_tiles.py`
- **Useful options:**

| Option | Meaning |
|---|---|
| `--min-valid 0.9` | Keep only tiles that are ≥ 90% clear (default 0.8) |
| `--force` | Re-write tiles that already exist |
| `--input file.tif --city X --year Y` | Tile one file (e.g. your old `IND_2022_001.tif`) |
| `--dn-offset 1000` | For raw satellite files that still have the +1000 offset (like your old tif) |

- **Tile name:** `Indore_r03_c05` = city, row 3, column 5. The same name in a different year = the same ground.
- It warns you if the years of a city are **not** on the same grid.
- It **drops** tiles that are too cloudy/empty.

---

## 5. What you get (the `dataset/` folder)

```
dataset/
├── tiles/<City>/<year>/<tile_id>.tif      the image tiles
├── quicklooks/<City>_<year>.png           a picture to eyeball each city-year
└── metadata/
    ├── tiles.gpkg      map file (open in QGIS or GeoPandas)
    ├── tiles.csv       same table, easy in Excel/pandas
    ├── pairs.csv       matching tiles across years (for change analysis)
    ├── stats.json      average + spread of each band (for AI model normalising)
    └── scenes.csv      which satellite passes were used (from search_scenes.py)
```

### The tile files (`.tif`)
- Size 256 × 256, 7 layers: **B02, B03, B04, B08, B11, B12, valid**
- Numbers are whole numbers. **Divide by 10000** to get real reflectance (0 to 1).
- `valid` layer: 1 = good pixel, 0 = no clear data.
- Has map location inside (CRS + position), so QGIS puts it in the right place.
- If a source file was missing SWIR bands (like your old 4-band tif), those layers are filled with 0.

### `tiles.gpkg` and `tiles.csv` (one row per tile per year)
| Column | Meaning |
|---|---|
| `tile_id`, `city`, `year`, `row`, `col` | Which tile |
| `window_start`, `window_end` | Dates used for the picture |
| `epsg`, `x_min…y_max` | Position in meters (UTM) |
| `lon_c`, `lat_c` | Centre point (lat/lon) |
| `valid_frac` | Share of good pixels (1.0 = perfect) |
| `clear_obs_mean` | Average number of clear views per pixel |
| `cloudy_obs_frac` | Share of views lost to cloud |
| `ndvi_mean` | Greenness (plants) – higher = more vegetation |
| `ndbi_mean` | Built-up areas – higher = more buildings/concrete |
| `mndwi_mean` | Water – higher = more water |
| `brightness` | Average visible brightness |
| `keep` | True if the tile passed the quality check |
| `path` | Where the tile file is |
| `n_acquisitions`, `scene_cloud_median` | Which passes fed it (only if you ran `search_scenes.py`) |
| `geometry` | Tile outline polygon (in `.gpkg`; as text `footprint_wkt` in the `.csv`) |

### `pairs.csv` (for the change-analysis teammate)
Each row = **the same tile in two different years**, where both years are good.
Columns: `city`, `tile_id`, `year_a`, `year_b`, `path_a`, `path_b`, `ndvi_delta`, `ndbi_delta`, `mndwi_delta`, `valid_frac_min`.
`ndvi_delta` = (year_b − year_a). Negative = less green over time.

### `stats.json`
Average and spread of each band across all kept tiles. Teammates use it to normalise images before feeding an AI model.

---

## 6. How teammates use your data

```python
import rasterio, geopandas as gpd

# read the tile table
tiles = gpd.read_file("dataset/metadata/tiles.gpkg", layer="tiles")
good = tiles[tiles.keep]

# read one tile as real reflectance
with rasterio.open("dataset/" + good.iloc[0].path) as src:
    data = src.read() / 10000        # bands: B02 B03 B04 B08 B11 B12 valid
    valid = src.read(7) == 1
```

- **Retrieval teammate:** use `tiles` + tile images (and `stats.json`) to make embeddings.
- **Change-analysis teammate:** use `pairs.csv` to load two years of the same tile and compare.

---

## 7. Other folders (optional)

### `projects_api/` — quick statistics, no images
| File | What it does |
|---|---|
| `cdse_api.py` | Talks to Copernicus; contains the recipe for NDVI/NDBI/MNDWI |
| `city_stats.py` | `yearly` = one number per city per year (+ change vs first year); `series` = numbers over time. Makes `city_stats_yearly.csv` / `city_stats_series.csv` |
| `city_grid.py` | Small pixel grid for a city (GeoTIFF + preview + change map between years) |
| `study_areas.py` | The 5 cities |

Example: `python city_stats.py yearly --city Indore --years 2020 2022 2024 --month 7`

### `projects/` — first attempt (replaced)
Downloads big raw satellite files, then clips them. Slow and heavy, and needs username/password. Files: `satellite_search.py`, `stac_utils.py`, `download_satellite.py`, `preprocess.py`, `study_areas.py`, plus `IND_2022_001_preview.png` (NDVI check of your real tif). You can ignore this folder.

---

## 8. Small dictionary

| Word | Simple meaning |
|---|---|
| **Sentinel-2** | European satellite that photographs Earth every ~5 days |
| **Band** | One colour/light layer (e.g. Red, Near-infrared) |
| **Reflectance** | How much light the ground reflects (0 = none, 1 = all) |
| **Composite** | One clean picture made by combining many photos |
| **Median** | The middle value – ignores odd extremes like leftover cloud |
| **Tile** | A small square piece cut from a big picture |
| **AOI** | Area Of Interest – the box around a city |
| **UTM / EPSG:32643** | A map system measured in meters (zone 43 covers your cities) |
| **NDVI** | Greenness index (plants) |
| **NDBI** | Built-up index (buildings) |
| **MNDWI** | Water index |
| **SCL** | Sentinel-2's label layer that marks cloud, shadow, water, etc. |
| **GeoTIFF** | An image file that also stores its location on Earth |
| **GeoPackage (.gpkg)** | A map database file (opens in QGIS / GeoPandas) |
| **Metadata** | The table that describes the data (the "data about data") |

---

## 9. If something goes wrong

| Problem | What to do |
|---|---|
| `Set CDSE_CLIENT_ID and CDSE_CLIENT_SECRET` | Make the `.env` file (copy `.env.example`) and fill in your keys |
| `Authentication failed` | Check the client id/secret are correct and not expired |
| `HTTP 400 ...` | The message after it says which request field is wrong – send it to me |
| `HTTP 429` | Too many requests – it waits and retries; if it keeps happening, run fewer cities/years at once |
| Quota used up | Check your Copernicus Dashboard; use `--dry-run` and smaller runs |
| Very few tiles kept | Too cloudy: lower `--min-valid`, or change the month window in `core.py` |
| `years are NOT on the same grid` | Composites were made with different settings – delete them and re-fetch with the same `GRID_TILES` |
| A tile has zeros in some bands | The source file didn't have those bands (normal for your old 4-band tif) |

# 🛰️ Satellite Intelligence Platform

**AI-powered semantic retrieval and multi-temporal change analysis of satellite imagery**

Smart India Hackathon 2026 · Problem Statement ID: SIH26227 · Team: Alogsphere

An AI platform that lets analysts search satellite imagery in plain language and detect
real land-use change over time — with visible evidence behind every alert, not a black box.

## What it does

- **Semantic search** — type a query like *"new construction near a river"* and get
  ranked, relevant satellite tiles in seconds.
- **Multi-temporal change detection** — compares imagery across 2020–2026 and builds a
  change mask + timeline for any location.
- **False-alarm suppression** — screens out cloud/haze, shadow, image misalignment, poor
  data quality, and likely seasonal variation, and states the specific reason.
- **Evidence & confidence** — every flagged change comes with a category, a confidence
  score, and a "why was this flagged" explanation.
- **Analyst review** — Confirm / Reject / Uncertain workflow with full provenance and
  export.

## Coverage

- **Cities:** Indore, Mumbai, Delhi, Bengaluru, Ahmedabad
- **Time range:** 2020–2026 (one cloud-filtered composite per city per year, Jan–Mar
  window to minimize monsoon cloud cover)
- **Source imagery:** Sentinel-2 L2A (ESA Copernicus Data Space), 10 m/pixel, 6 spectral
  bands, tiled into 256×256 px tiles

## Repository structure

| Folder | Owns | What's inside |
|---|---|---|
| `preprocessing/` | Data pipeline | Scene search, composite fetching, tiling, metadata (NDVI/NDBI/MNDWI, `tiles.csv`, `pairs.csv`, `stats.json`) |
| `semantic_search/` | AI/ML — search | CLIP embeddings + FAISS index, natural-language tile search |
| `change_detection/` | AI/ML — change analysis | Multi-year change maps, false-alarm screening, change category, evidence & confidence scoring |
| `backend/` | API | FastAPI server, database, endpoints for search and change results |
| `frontend/` / `app/` | UI | Analyst dashboard — map, search, before/after viewer, evidence panel |
| `tests/` | QA | Test coverage for the above modules |
| `satellite_dataset/` | Data | Local/sample dataset artifacts |

Each module folder has its own `README.md` with setup and run instructions.

## How the pieces fit together

```
USER → FRONTEND → BACKEND (FastAPI) → Semantic Search | Change Detection | Database
                          ↑
      Data Pipeline: scene search → composite fetch → tiling → metadata
```

## Key design decisions

- **Fixed, pixel-aligned grid per city** — every year is captured on the identical grid,
  so any two years are directly comparable without extra image registration.
- **Rule-based, explainable logic** — false-alarm and change-category classification are
  transparent and tunable, not an opaque model, by design — every result states its
  reason.
- **Temporal persistence over single-snapshot comparison** — a change is only treated as
  a strong signal if it holds up across multiple consecutive years, not just one before/
  after pair.

## Known limitations

- Sentinel-2's 10 m/pixel resolution cannot reliably confirm small objects (individual
  buildings, vehicles, short road segments) — change category for such cases is an
  **estimate**, flagged as low-confidence in the UI, not a confirmed detection.
- False-alarm and category thresholds are heuristic and may need per-city tuning.
- Imagery window is fixed to Jan–Mar each year, so monsoon-season change is out of scope
  for this version.

## Team

| Module | Member |
|---|---|
| Data pipeline (preprocessing) | Member 2 |
| Semantic search (AI/ML) | Member 1 |
| Change detection + false-alarm suppression | Member 3 |
| Backend / API | Member 4 |
| Frontend | Member 5 |
| Analyst workflow & testing | Member 6 |

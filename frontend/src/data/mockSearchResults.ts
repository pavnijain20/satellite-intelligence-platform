import before from "@/assets/site003-before.jpg";
import after from "@/assets/site003-after.jpg";
import water from "@/assets/site-water.jpg";
import road from "@/assets/site-road.jpg";
import type { SearchResult } from "./types";

export const imagery = { before, after, water, road };

/**
 * DEMO DATA
 *
 * Expanded demo catalogue for frontend/SIH demonstration.
 * Covers multiple Indian regions, satellites, sensors, categories,
 * resolutions, quality levels and acquisition dates.
 *
 * Replace with backend `searchSatelliteData()` response
 * when the FastAPI/geospatial pipeline is connected.
 */
export const mockSearchResults: SearchResult[] = [
  /* ---------------------------------------------------------------------- */
  /* SENTINEL-2                                                            */
  /* ---------------------------------------------------------------------- */

  {
    id: "SITE-003",
    label: "SITE-003",
    location: "Nagpur Outer Ring Road, Maharashtra",
    latitude: 21.1458,
    longitude: 79.0882,
    sensor: "Sentinel-2 L2A",
    date: "2025-09-20",
    thumbnail: after,
    quality: "excellent",
    cloudCover: 3,
    resolution: "10 m",
    category: "construction",
    relevance: 0.91,
    changeDetected: true,
    ranking: {
      semantic: 0.93,
      spatial: 0.88,
      temporal: 0.94,
      sensor: 0.9,
    },
  },

  {
    id: "SITE-011",
    label: "SITE-011",
    location: "NH-44 Corridor, Betul District",
    latitude: 21.9,
    longitude: 77.9,
    sensor: "Sentinel-2 L2A",
    date: "2025-08-28",
    thumbnail: road,
    quality: "good",
    cloudCover: 8,
    resolution: "10 m",
    category: "road",
    relevance: 0.84,
    changeDetected: true,
    ranking: {
      semantic: 0.86,
      spatial: 0.79,
      temporal: 0.88,
      sensor: 0.85,
    },
  },

  {
    id: "SITE-019",
    label: "SITE-019",
    location: "Butibori Industrial Belt, Nagpur",
    latitude: 20.93,
    longitude: 79.0,
    sensor: "Sentinel-2 L2A",
    date: "2025-09-02",
    thumbnail: before,
    quality: "fair",
    cloudCover: 22,
    resolution: "10 m",
    category: "activity",
    relevance: 0.71,
    changeDetected: false,
    ranking: {
      semantic: 0.75,
      spatial: 0.7,
      temporal: 0.66,
      sensor: 0.8,
    },
  },

  {
    id: "SITE-031",
    label: "SITE-031",
    location: "Samruddhi Expressway Interchange, Maharashtra",
    latitude: 21.35,
    longitude: 78.72,
    sensor: "Sentinel-2 L2A",
    date: "2026-01-12",
    thumbnail: road,
    quality: "excellent",
    cloudCover: 2,
    resolution: "10 m",
    category: "construction",
    relevance: 0.89,
    changeDetected: true,
    ranking: {
      semantic: 0.9,
      spatial: 0.86,
      temporal: 0.91,
      sensor: 0.9,
    },
  },

  {
    id: "SITE-042",
    label: "SITE-042",
    location: "Ahmedabad Industrial Expansion Zone, Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    sensor: "Sentinel-2 L2A",
    date: "2025-11-16",
    thumbnail: after,
    quality: "excellent",
    cloudCover: 4,
    resolution: "10 m",
    category: "construction",
    relevance: 0.86,
    changeDetected: true,
    ranking: {
      semantic: 0.88,
      spatial: 0.82,
      temporal: 0.87,
      sensor: 0.9,
    },
  },

  {
    id: "SITE-056",
    label: "SITE-056",
    location: "Bhubaneswar Peri-Urban Corridor, Odisha",
    latitude: 20.2961,
    longitude: 85.8245,
    sensor: "Sentinel-2 L2A",
    date: "2025-10-08",
    thumbnail: before,
    quality: "good",
    cloudCover: 12,
    resolution: "10 m",
    category: "vegetation",
    relevance: 0.73,
    changeDetected: true,
    ranking: {
      semantic: 0.76,
      spatial: 0.72,
      temporal: 0.7,
      sensor: 0.82,
    },
  },

  {
    id: "SITE-068",
    label: "SITE-068",
    location: "Jaipur Northern Development Zone, Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    sensor: "Sentinel-2 L2A",
    date: "2026-02-05",
    thumbnail: road,
    quality: "good",
    cloudCover: 7,
    resolution: "10 m",
    category: "road",
    relevance: 0.8,
    changeDetected: true,
    ranking: {
      semantic: 0.82,
      spatial: 0.78,
      temporal: 0.8,
      sensor: 0.86,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* SENTINEL-1 SAR                                                        */
  /* ---------------------------------------------------------------------- */

  {
    id: "SITE-024",
    label: "SITE-024",
    location: "Kanhan River Bank, Kamptee",
    latitude: 21.22,
    longitude: 79.19,
    sensor: "Sentinel-1 GRD",
    date: "2025-06-30",
    thumbnail: water,
    quality: "good",
    cloudCover: 0,
    resolution: "20 m",
    category: "vegetation",
    relevance: 0.64,
    changeDetected: false,
    ranking: {
      semantic: 0.66,
      spatial: 0.71,
      temporal: 0.58,
      sensor: 0.6,
    },
  },

  {
    id: "SITE-074",
    label: "SITE-074",
    location: "Kutch Coastal Belt, Gujarat",
    latitude: 23.7337,
    longitude: 69.8597,
    sensor: "Sentinel-1 GRD",
    date: "2025-12-18",
    thumbnail: water,
    quality: "excellent",
    cloudCover: 0,
    resolution: "20 m",
    category: "water",
    relevance: 0.81,
    changeDetected: true,
    ranking: {
      semantic: 0.83,
      spatial: 0.78,
      temporal: 0.82,
      sensor: 0.92,
    },
  },

  {
    id: "SITE-081",
    label: "SITE-081",
    location: "Brahmaputra Floodplain, Assam",
    latitude: 26.1445,
    longitude: 91.7362,
    sensor: "Sentinel-1 GRD",
    date: "2025-08-11",
    thumbnail: water,
    quality: "good",
    cloudCover: 0,
    resolution: "20 m",
    category: "water",
    relevance: 0.79,
    changeDetected: true,
    ranking: {
      semantic: 0.82,
      spatial: 0.75,
      temporal: 0.8,
      sensor: 0.9,
    },
  },

  {
    id: "SITE-093",
    label: "SITE-093",
    location: "Leh Valley Transport Corridor, Ladakh",
    latitude: 34.1526,
    longitude: 77.5771,
    sensor: "Sentinel-1 GRD",
    date: "2026-01-25",
    thumbnail: road,
    quality: "fair",
    cloudCover: 0,
    resolution: "20 m",
    category: "activity",
    relevance: 0.69,
    changeDetected: true,
    ranking: {
      semantic: 0.72,
      spatial: 0.67,
      temporal: 0.7,
      sensor: 0.86,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* LANDSAT-9                                                              */
  /* ---------------------------------------------------------------------- */

  {
    id: "SITE-007",
    label: "SITE-007",
    location: "Totladoh Reservoir, Pench Basin",
    latitude: 21.65,
    longitude: 79.25,
    sensor: "Landsat-9 OLI-2",
    date: "2025-07-14",
    thumbnail: water,
    quality: "good",
    cloudCover: 11,
    resolution: "30 m",
    category: "water",
    relevance: 0.78,
    changeDetected: true,
    ranking: {
      semantic: 0.8,
      spatial: 0.74,
      temporal: 0.77,
      sensor: 0.72,
    },
  },

  {
    id: "SITE-102",
    label: "SITE-102",
    location: "Narmada River Basin, Madhya Pradesh",
    latitude: 22.7179,
    longitude: 75.8333,
    sensor: "Landsat-9 OLI-2",
    date: "2025-10-21",
    thumbnail: water,
    quality: "excellent",
    cloudCover: 5,
    resolution: "30 m",
    category: "water",
    relevance: 0.83,
    changeDetected: true,
    ranking: {
      semantic: 0.85,
      spatial: 0.79,
      temporal: 0.84,
      sensor: 0.78,
    },
  },

  {
    id: "SITE-114",
    label: "SITE-114",
    location: "Jaisalmer Solar Development Zone, Rajasthan",
    latitude: 26.9157,
    longitude: 70.9083,
    sensor: "Landsat-9 OLI-2",
    date: "2026-01-08",
    thumbnail: after,
    quality: "excellent",
    cloudCover: 2,
    resolution: "30 m",
    category: "construction",
    relevance: 0.77,
    changeDetected: true,
    ranking: {
      semantic: 0.8,
      spatial: 0.73,
      temporal: 0.81,
      sensor: 0.76,
    },
  },

  {
    id: "SITE-127",
    label: "SITE-127",
    location: "Deccan Agricultural Belt, Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    sensor: "Landsat-9 OLI-2",
    date: "2025-09-29",
    thumbnail: before,
    quality: "good",
    cloudCover: 9,
    resolution: "30 m",
    category: "vegetation",
    relevance: 0.72,
    changeDetected: true,
    ranking: {
      semantic: 0.74,
      spatial: 0.7,
      temporal: 0.75,
      sensor: 0.77,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* ADDITIONAL MIXED RESULTS                                               */
  /* ---------------------------------------------------------------------- */

  {
    id: "SITE-139",
    label: "SITE-139",
    location: "Pune Metropolitan Expansion Zone, Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    sensor: "Sentinel-2 L2A",
    date: "2025-12-03",
    thumbnail: after,
    quality: "excellent",
    cloudCover: 6,
    resolution: "10 m",
    category: "construction",
    relevance: 0.88,
    changeDetected: true,
    ranking: {
      semantic: 0.9,
      spatial: 0.84,
      temporal: 0.89,
      sensor: 0.9,
    },
  },

  {
    id: "SITE-145",
    label: "SITE-145",
    location: "Chennai Coastal Development Zone, Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    sensor: "Sentinel-1 GRD",
    date: "2025-11-04",
    thumbnail: road,
    quality: "good",
    cloudCover: 0,
    resolution: "20 m",
    category: "road",
    relevance: 0.76,
    changeDetected: true,
    ranking: {
      semantic: 0.78,
      spatial: 0.73,
      temporal: 0.77,
      sensor: 0.88,
    },
  },

  {
    id: "SITE-153",
    label: "SITE-153",
    location: "Srinagar Valley Urban Fringe, Jammu and Kashmir",
    latitude: 34.0837,
    longitude: 74.7973,
    sensor: "Sentinel-2 L2A",
    date: "2025-10-15",
    thumbnail: before,
    quality: "fair",
    cloudCover: 24,
    resolution: "10 m",
    category: "activity",
    relevance: 0.67,
    changeDetected: false,
    ranking: {
      semantic: 0.7,
      spatial: 0.65,
      temporal: 0.64,
      sensor: 0.82,
    },
  },

  {
    id: "SITE-161",
    label: "SITE-161",
    location: "Kolkata Wetland Fringe, West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    sensor: "Landsat-9 OLI-2",
    date: "2025-08-22",
    thumbnail: water,
    quality: "good",
    cloudCover: 13,
    resolution: "30 m",
    category: "water",
    relevance: 0.74,
    changeDetected: true,
    ranking: {
      semantic: 0.77,
      spatial: 0.7,
      temporal: 0.76,
      sensor: 0.74,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* SEARCH EXAMPLES                                                           */
/* -------------------------------------------------------------------------- */

export const exampleQueries = [
  "Find new construction near major roads.",
  "Show changes in water bodies.",
  "Detect recent infrastructure development.",
  "Find activity changes between 2024 and 2026.",
];

/* -------------------------------------------------------------------------- */
/* RECENT SEARCHES                                                           */
/* -------------------------------------------------------------------------- */

export const recentSearches = [
  "Find new construction near roads detected after June 2025",
  "Vegetation loss around Pench basin",
  "Unregistered quarry activity, Sentinel-1 only",
];
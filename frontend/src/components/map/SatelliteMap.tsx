import "leaflet/dist/leaflet.css";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Rectangle,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { SearchResult } from "@/data/types";
import { DemoTag } from "@/components/common/Panel";

/**
 * Base map tile sources.
 *
 * OSM = street map
 * Esri World Imagery = satellite imagery
 * Esri World Boundaries and Places = labels/reference overlay
 */
const STREET_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const SATELLITE_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const LABELS_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const OSM_ATTRIBUTION = "&copy; OpenStreetMap contributors";

const ESRI_ATTRIBUTION =
  "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community";

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 11), {
      duration: 0.8,
    });
  }, [lat, lng, map]);

  return null;
}

export interface SatelliteMapProps {
  results: SearchResult[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
  aoi?: boolean;

  baseMap?: "street" | "satellite" | "satelliteLabels";

  showResults?: boolean;
  showAOI?: boolean;
  showSimilar?: boolean;

  satelliteConfigured?: boolean;

  similarSites?: SearchResult[];
}

export default function SatelliteMap({
  results,
  selectedId,
  onSelect,
  onOpen,
  aoi = true,
  baseMap = "street",
  showResults = true,
  showAOI = true,
  showSimilar = false,
  similarSites = [],
}: SatelliteMapProps) {
  const center = results[0]
    ? ([results[0].latitude, results[0].longitude] as [number, number])
    : ([21.1458, 79.0882] as [number, number]);

  const selected = results.find((r) => r.id === selectedId);

  const isSatellite = baseMap === "satellite";
  const isSatelliteLabels = baseMap === "satelliteLabels";

  const isDemoSatellite = isSatellite || isSatelliteLabels;

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      {/* STREET MAP */}
      {baseMap === "street" && (
        <TileLayer
          url={STREET_URL}
          attribution={OSM_ATTRIBUTION}
        />
      )}

      {/* SATELLITE MAP */}
      {isSatellite && (
        <TileLayer
          url={SATELLITE_URL}
          attribution={ESRI_ATTRIBUTION}
        />
      )}

      {/* SATELLITE + LABELS */}
      {isSatelliteLabels && (
        <>
          <TileLayer
            url={SATELLITE_URL}
            attribution={ESRI_ATTRIBUTION}
          />

          <TileLayer
            url={LABELS_URL}
            attribution=""
            opacity={0.9}
          />
        </>
      )}

      {/* Demo badge for satellite basemaps */}
      {isDemoSatellite && (
        <DemoTag className="absolute top-2 left-2 z-[600]" />
      )}

      {/* AOI Boundary */}
      {showAOI && aoi && (
        <Rectangle
          bounds={[
            [20.75, 78.5],
            [22.05, 79.5],
          ]}
          pathOptions={{
            color: "oklch(0.72 0.135 215)",
            weight: 1,
            dashArray: "6 6",
            fillOpacity: 0.03,
          }}
        />
      )}

      {/* Search result markers */}
      {showResults &&
        results.map((r) => {
          const isSelected = r.id === selectedId;

          const color = isSelected
            ? "oklch(0.95 0.008 240)"
            : r.changeDetected
              ? "oklch(0.68 0.2 35)"
              : "oklch(0.72 0.135 215)";

          return (
            <CircleMarker
              key={r.id}
              center={[r.latitude, r.longitude]}
              radius={isSelected ? 12 : 8}
              pathOptions={{
                color,
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 0.55 : 0.3,
              }}
              eventHandlers={{
                click: () => onSelect?.(r.id),
              }}
            >
              <Popup>
                <div className="min-w-44 space-y-1">
                  <p className="font-mono text-xs text-primary">
                    {r.id}
                  </p>

                  <p className="text-xs font-medium">
                    {r.location}
                  </p>

                  <p className="font-mono text-[11px] opacity-70">
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </p>

                  <p className="font-mono text-[11px] opacity-70">
                    {r.sensor} · {r.date}
                  </p>

                  <button
                    onClick={() => onOpen?.(r.id)}
                    className="mt-1 w-full rounded border border-current px-2 py-1 text-[11px] font-medium"
                  >
                    Open Analysis
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      {/* Similar site markers */}
      {showSimilar &&
        similarSites.map((s) => (
          <CircleMarker
            key={s.id}
            center={[s.latitude, s.longitude]}
            radius={6}
            pathOptions={{
              color: "oklch(0.4 0.3 120)",
              weight: 1,
              fillColor: "oklch(0.4 0.3 120)",
              fillOpacity: 0.4,
            }}
          />
        ))}

      {/* Recenter selected result */}
      {selected && (
        <Recenter
          lat={selected.latitude}
          lng={selected.longitude}
        />
      )}
    </MapContainer>
  );
}
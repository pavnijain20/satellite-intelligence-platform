import { useCallback, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

export interface MaskRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ChangeMask({
  regions,
  opacity,
  visible,
}: {
  regions: MaskRegion[];
  opacity: number;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {regions.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-sm border-2 border-change bg-change transition-opacity duration-300"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            width: `${r.w}%`,
            height: `${r.h}%`,
            opacity,
            mixBlendMode: "screen",
          }}
        />
      ))}
    </div>
  );
}

export interface ImageMeta {
  sensor: string;
  date: string;
  location: string;
  imageId: string;
}

export function ImageViewer({
  src,
  alt,
  meta,
  overlay,
  className,
  corner,
}: {
  src: string;
  alt: string;
  meta?: ImageMeta;
  overlay?: React.ReactNode;
  className?: string;
  corner?: React.ReactNode;
}) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [full, setFull] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const body = (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-surface",
        full ? "h-full w-full" : className,
      )}
    >
      <div
        className="relative h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        }}
        onMouseMove={(e) => {
          if (!drag.current || zoom === 1) return;
          setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
        }}
        onMouseUp={() => (drag.current = null)}
        onMouseLeave={() => (drag.current = null)}
        onDoubleClick={() => setZoom((z) => (z >= 3 ? 1 : z + 1))}
      >
        <div
          className="h-full w-full transition-transform duration-150"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }}
        >
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="h-full w-full select-none object-cover"
            draggable={false}
          />
          {overlay}
        </div>
      </div>

      <div className="absolute right-2 top-2 flex gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Reset view" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={full ? "Exit fullscreen" : "Fullscreen"}
          onClick={() => setFull((f) => !f)}
        >
          {full ? <X className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {corner}

      {meta && (
        <dl className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-x-4 gap-y-0.5 border-t border-border bg-background/85 px-3 py-2 font-mono text-[10px] text-muted-foreground backdrop-blur sm:grid-cols-4">
          <div>
            <dt className="uppercase tracking-widest opacity-70">Sensor</dt>
            <dd className="text-foreground">{meta.sensor}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-widest opacity-70">Acquired</dt>
            <dd className="text-foreground">{meta.date}</dd>
          </div>
          <div className="truncate">
            <dt className="uppercase tracking-widest opacity-70">Location</dt>
            <dd className="truncate text-foreground">{meta.location}</dd>
          </div>
          <div className="truncate">
            <dt className="uppercase tracking-widest opacity-70">Image ID</dt>
            <dd className="truncate text-foreground">{meta.imageId}</dd>
          </div>
        </dl>
      )}
      <span className="absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
    </div>
  );

  if (full) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 p-4 backdrop-blur">
        <div className="h-full w-full">{body}</div>
      </div>
    );
  }
  return body;
}

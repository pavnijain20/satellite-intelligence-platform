import { useRef, useState } from "react";
import { Columns2, MoveHorizontal } from "lucide-react";
import { ChangeMask, ImageViewer, type MaskRegion } from "@/components/analysis/ImageViewer";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeDate: string;
  afterDate: string;
  sensor: string;
  location: string;
  beforeId: string;
  afterId: string;
  maskRegions: MaskRegion[];
  maskVisible: boolean;
  maskOpacity: number;
}

function Swipe({
  beforeSrc,
  afterSrc,
  beforeDate,
  afterDate,
  mask,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeDate: string;
  afterDate: string;
  mask: React.ReactNode;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-md border border-border bg-surface"
      onMouseDown={(e) => {
        dragging.current = true;
        update(e.clientX);
      }}
      onMouseMove={(e) => dragging.current && update(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchMove={(e) => update(e.touches[0]!.clientX)}
    >
      <img
        src={afterSrc}
        alt={`After — ${afterDate}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {mask}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={beforeSrc}
          alt={`Before — ${beforeDate}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ width: ref.current?.clientWidth ?? "100%", maxWidth: "none" }}
        />
      </div>
      <div
        className="absolute inset-y-0 z-10 w-0.5 bg-primary"
        style={{ left: `${pos}%` }}
        aria-hidden
      >
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-background text-primary">
          <MoveHorizontal className="h-4 w-4" />
        </span>
      </div>
      <label className="sr-only" htmlFor="swipe-range">
        Before/after swipe position
      </label>
      <input
        id="swipe-range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute bottom-2 left-1/2 z-20 w-2/3 -translate-x-1/2 accent-[var(--color-primary)]"
      />
      <span className="absolute left-2 top-2 rounded bg-background/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Before · {beforeDate}
      </span>
      <span className="absolute right-2 top-2 rounded bg-background/85 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        After · {afterDate}
      </span>
    </div>
  );
}

export function CompareViewer(props: Props) {
  const [mode, setMode] = useState<"side" | "swipe">("side");
  const mask = (
    <ChangeMask
      regions={props.maskRegions}
      opacity={props.maskOpacity}
      visible={props.maskVisible}
    />
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label-caps">Before / after comparison</span>
        <div className="flex gap-1 rounded-md border border-border p-0.5">
          {(
            [
              { key: "side", label: "Side by side", Icon: Columns2 },
              { key: "swipe", label: "Swipe", Icon: MoveHorizontal },
            ] as const
          ).map(({ key, label, Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={mode === key ? "primary" : "ghost"}
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={cn("rounded-[5px]")}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {mode === "side" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <p className="label-caps mb-1">Before · {props.beforeDate}</p>
            <ImageViewer
              src={props.beforeSrc}
              alt={`Before observation ${props.beforeDate}`}
              className="aspect-[4/3]"
              meta={{
                sensor: props.sensor,
                date: props.beforeDate,
                location: props.location,
                imageId: props.beforeId,
              }}
            />
          </div>
          <div>
            <p className="label-caps mb-1">After · {props.afterDate}</p>
            <ImageViewer
              src={props.afterSrc}
              alt={`After observation ${props.afterDate}`}
              className="aspect-[4/3]"
              overlay={mask}
              meta={{
                sensor: props.sensor,
                date: props.afterDate,
                location: props.location,
                imageId: props.afterId,
              }}
            />
          </div>
        </div>
      ) : (
        <Swipe
          beforeSrc={props.beforeSrc}
          afterSrc={props.afterSrc}
          beforeDate={props.beforeDate}
          afterDate={props.afterDate}
          mask={mask}
        />
      )}
    </div>
  );
}

import { useRef, useState } from "react";
import { History, ImagePlus, Loader2, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { exampleQueries, recentSearches } from "@/data/mockSearchResults";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string, image: File | null) => void;
  loading?: boolean;
  image: File | null;
  onImageChange: (f: File | null) => void;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
  image,
  onImageChange,
  className,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const setFile = (f: File | null) => {
    onImageChange(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  return (
    <div className={cn("relative", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value, image);
          setFocused(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f && f.type.startsWith("image/")) setFile(f);
        }}
        className={cn(
          "rounded-xl border bg-panel/70 p-2 transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border",
        )}
        role="search"
      >
        <div className="flex items-center gap-2">
          <Search className="ml-2 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <label htmlFor="semantic-query" className="sr-only">
            Natural-language satellite query
          </label>
          <input
            id="semantic-query"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 150)}
            placeholder="Search satellite imagery using natural language…"
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear search"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            title="Add a reference image (multimodal search)"
          >
            <ImagePlus className="h-4 w-4" />
            <span className="hidden sm:inline">Image</span>
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>

        {preview && (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-surface p-2">
            <img
              src={preview}
              alt="Reference tile preview"
              className="h-14 w-14 rounded object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-foreground">{image?.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                Visual query · combined with text prompt
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => fileRef.current?.click()}
            >
              Replace
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={() => setFile(null)}>
              <X className="h-4 w-4" /> Remove
            </Button>
          </div>
        )}
        {!preview && (
          <p className="mt-1.5 px-2 pb-0.5 text-[11px] text-muted-foreground">
            Press Enter to search · drag & drop a satellite tile here for multimodal search
          </p>
        )}
      </form>

      {focused && !value && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-lg border border-border bg-popover p-3 shadow-2xl">
          <p className="label-caps mb-1.5">Example queries</p>
          <ul className="mb-3 space-y-1">
            {exampleQueries.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange(q);
                    onSubmit(q, image);
                  }}
                  className="w-full rounded px-2 py-1.5 text-left text-xs text-foreground hover:bg-accent"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
          <p className="label-caps mb-1.5 flex items-center gap-1.5">
            <History className="h-3 w-3" /> Recent searches
          </p>
          <ul className="space-y-1">
            {recentSearches.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange(q);
                    onSubmit(q, image);
                  }}
                  className="w-full rounded px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

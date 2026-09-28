import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { exportInvestigation, type ExportFormat } from "@/services/api";
import { useApp } from "@/context/AppContext";

const OPTIONS: {
  key: ExportFormat;
  label: string;
  Icon: typeof FileText;
  hint: string;
}[] = [
  {
    key: "summary",
    label: "Investigation summary",
    Icon: NotebookPen,
    hint: "One-page analyst brief",
  },
  {
    key: "evidence",
    label: "Evidence report",
    Icon: FileText,
    hint: "Evidence, warnings, provenance",
  },
  {
    key: "images",
    label: "Images",
    Icon: ImageIcon,
    hint: "Before / after / mask",
  },
  {
    key: "json",
    label: "JSON",
    Icon: FileJson,
    hint: "Raw analysis record",
  },
  {
    key: "csv",
    label: "CSV",
    Icon: FileSpreadsheet,
    hint: "Tabular observations",
  },
  {
    key: "pdf",
    label: "PDF report",
    Icon: FileText,
    hint: "Printable dossier",
  },
];

export function ExportMenu({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [done, setDone] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { pushNotification } = useApp();

  useEffect(() => {
    if (!open) return;

    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDoc);

    return () => {
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  const run = async (format: ExportFormat) => {
    setBusy(format);
    setDone(null);

    try {
      const res = await exportInvestigation(siteId, format);

      // Create a temporary browser URL for the generated file.
      const url = URL.createObjectURL(res.blob);

      // Create an invisible download link.
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = res.filename;

      // Trigger the browser download.
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Release the temporary object URL.
      URL.revokeObjectURL(url);

      setDone(format);

      pushNotification({
        kind: "success",
        title: "Export completed",
        detail: `${res.filename} downloaded successfully.`,
      });
    } catch (error) {
      console.error("[ExportMenu] export failed:", error);

      pushNotification({
        kind: "error",
        title: "Export failed",
        detail: `Could not export ${siteId}.`,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="primary"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Download className="h-4 w-4" /> Export
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
          <p className="label-caps border-b border-border px-3 py-2">
            Export investigation {siteId}
          </p>

          <ul className="p-1">
            {OPTIONS.map(({ key, label, Icon, hint }) => (
              <li key={key}>
                <button
                  onClick={() => run(key)}
                  disabled={busy !== null}
                  className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left hover:bg-accent disabled:opacity-60"
                >
                  <Icon className="h-4 w-4 text-primary" />

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-foreground">
                      {label}
                    </span>

                    <span className="block text-[10px] text-muted-foreground">
                      {hint}
                    </span>
                  </span>

                  {busy === key && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  )}

                  {done === key && (
                    <Check className="h-3.5 w-3.5 text-ok" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <p className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
            Files are generated locally in demo mode.
          </p>
        </div>
      )}
    </div>
  );
}
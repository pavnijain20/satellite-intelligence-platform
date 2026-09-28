import { useState } from "react";
import { Check, Loader2, ThumbsDown, ThumbsUp, TriangleAlert, UserCheck, X } from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Button } from "@/components/common/Button";
import { Pill } from "@/components/common/Indicators";
import { categoryMeta } from "@/data/mockAnalysis";
import { submitFeedback, submitReview } from "@/services/api";
import { useApp } from "@/context/AppContext";
import type { AnalysisRecord, ChangeCategory, ReviewDecision } from "@/data/types";
import { cn } from "@/lib/utils";

const DECISIONS: {
  key: Exclude<ReviewDecision, null>;
  label: string;
  Icon: typeof Check;
  variant: "success" | "danger" | "outline";
}[] = [
  { key: "confirmed", label: "Confirm", Icon: Check, variant: "success" },
  { key: "rejected", label: "Reject", Icon: X, variant: "danger" },
  { key: "uncertain", label: "Uncertain", Icon: TriangleAlert, variant: "outline" },
];

export function ReviewPanel({ record }: { record: AnalysisRecord }) {
  const { reviews, saveReview, pushNotification } = useApp();
  const existing = reviews[record.id];
  const [decision, setDecision] = useState<ReviewDecision>(existing?.decision ?? null);
  const [category, setCategory] = useState<ChangeCategory>(
    (existing?.category as ChangeCategory) ?? record.category,
  );
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const submit = async () => {
    if (!decision) return;
    setSaving(true);
    setError(null);
    try {
      const res = await submitReview(record.id, { decision, comment, category });
      saveReview(record.id, { decision, comment, category, at: res.at });
      pushNotification({
        kind: "success",
        title: "Review submitted",
        detail: `${record.id} marked as ${decision}.`,
      });
    } catch {
      setError("Could not submit the review. Check the backend connection and retry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <PanelHeader
        title="Analyst review"
        subtitle="Human decision recorded against this investigation"
        icon={<UserCheck className="h-4 w-4" />}
        actions={
          existing ? (
            <Pill
              tone={
                existing.decision === "confirmed"
                  ? "ok"
                  : existing.decision === "rejected"
                    ? "alert"
                    : "warn"
              }
            >
              {existing.decision}
            </Pill>
          ) : (
            <Pill tone="muted">Pending review</Pill>
          )
        }
      />
      <div className="space-y-4 p-4">
        <div>
          <p className="label-caps mb-1.5">Analyst decision</p>
          <div className="flex flex-wrap gap-2">
            {DECISIONS.map(({ key, label, Icon, variant }) => (
              <Button
                key={key}
                variant={decision === key ? variant : "outline"}
                onClick={() => setDecision(key)}
                aria-pressed={decision === key}
                className={cn(decision === key && "ring-1 ring-current")}
              >
                <Icon className="h-4 w-4" /> {label}
              </Button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="label-caps">Change category (analyst adjusted)</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ChangeCategory)}
            className="mt-1 w-full rounded-md border border-input bg-surface px-2 py-2 text-xs text-foreground"
          >
            {Object.entries(categoryMeta).map(([key, m]) => (
              <option key={key} value={key}>
                {m.icon} {m.label}
              </option>
            ))}
          </select>
          {category !== record.category && (
            <span className="mt-1 block text-[11px] text-warn">
              Differs from the AI classification ({categoryMeta[record.category]!.label}).
            </span>
          )}
        </label>

        <label className="block">
          <span className="label-caps">Comment</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="New structures are clearly visible across three observations…"
            className="mt-1 w-full resize-y rounded-md border border-input bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={submit} disabled={!decision || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Submitting…" : "Submit review"}
          </Button>
          {existing && (
            <span className="font-mono text-[11px] text-muted-foreground">
              Previous decision: {existing.decision} · {new Date(existing.at).toLocaleString()}
            </span>
          )}
        </div>

        <div className="rounded-md border border-border bg-surface/60 p-3">
          <p className="label-caps mb-1.5">Model feedback</p>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Was this detection useful? Feedback is queued for model retraining.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={feedback === true ? "success" : "outline"}
              onClick={() => {
                setFeedback(true);
                void submitFeedback(record.id, { helpful: true });
              }}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> Useful
            </Button>
            <Button
              size="sm"
              variant={feedback === false ? "danger" : "outline"}
              onClick={() => {
                setFeedback(false);
                void submitFeedback(record.id, { helpful: false });
              }}
            >
              <ThumbsDown className="h-3.5 w-3.5" /> Not useful
            </Button>
            {feedback !== null && (
              <span className="self-center text-[11px] text-muted-foreground">
                Feedback recorded (demo)
              </span>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

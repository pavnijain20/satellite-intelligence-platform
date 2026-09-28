import { useEffect, useRef, useState } from "react";
import { Bot, Eraser, Loader2, Send, User } from "lucide-react";
import { Panel, PanelHeader } from "@/components/common/Panel";
import { Button } from "@/components/common/Button";
import { suggestedQuestions } from "@/data/mockHistory";
import { askInvestigationAssistant } from "@/services/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return (
      <p
        key={i}
        className={cn("text-xs leading-relaxed", line.trim() === "" && "h-2")}
        dangerouslySetInnerHTML={{ __html: bold }}
      />
    );
  });
}

export function InvestigationAssistant({ siteId }: { siteId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "assistant",
      text: `Investigation context loaded for **${siteId}**. Ask about the flag rationale, the evidence, false-alarm factors, or request a summary.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const ask = async (question: string) => {
    if (!question.trim() || thinking) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text: question }]);
    setThinking(true);
    try {
      const answer = await askInvestigationAssistant(question, { siteId });
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: answer }]);
    } catch {
      setError("The assistant is unavailable. Retry once the backend is reachable.");
    } finally {
      setThinking(false);
    }
  };

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        title="AI Investigation Assistant"
        subtitle={`Context: ${siteId} · demo responses`}
        icon={<Bot className="h-4 w-4" />}
        actions={
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setMessages([
                {
                  id: "m0",
                  role: "assistant",
                  text: `Conversation cleared. Context remains **${siteId}**.`,
                },
              ])
            }
          >
            <Eraser className="h-3.5 w-3.5" /> Clear
          </Button>
        }
      />

      <div ref={scrollRef} className="max-h-[26rem] min-h-56 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <span
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                m.role === "user"
                  ? "border-border bg-secondary text-foreground"
                  : "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              {m.role === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-lg border px-3 py-2",
                m.role === "user"
                  ? "border-border bg-secondary/70 text-foreground"
                  : "border-primary/25 bg-surface/80 text-foreground",
              )}
            >
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 px-1 text-xs text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analysing investigation context…
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={thinking}
              className="rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask the investigation assistant
          </label>
          <input
            id="assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this investigation…"
            className="h-9 flex-1 rounded-md border border-input bg-surface px-3 text-xs text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="primary" disabled={thinking || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Ask</span>
          </Button>
        </form>
      </div>
    </Panel>
  );
}

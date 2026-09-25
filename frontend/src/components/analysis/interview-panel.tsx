"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Lock, Send, Sparkles } from "lucide-react";
import type { InterrogationSession } from "@/types";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

const INLINE_MARKDOWN = /\*\*([^*\n]+)\*\*|(?<!\w)_([^_\n]+)_(?!\w)/g;

/**
 * Render the small subset of markdown the interview coach emits (**bold**, _italic_)
 * as React nodes, so no raw HTML is ever injected.
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(INLINE_MARKDOWN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));
    nodes.push(
      match[1] !== undefined ? (
        <strong key={index} className="font-semibold">
          {match[1]}
        </strong>
      ) : (
        <em key={index}>{match[2]}</em>
      )
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

interface InterviewPanelProps {
  session: InterrogationSession | null;
  isAuthenticated: boolean;
  isStarting: boolean;
  isSending: boolean;
  error: string | null;
  onStart: () => void;
  /** Resolves true once the message reached the server. */
  onSend: (message: string) => Promise<boolean>;
}

export function InterviewPanel({ session, isAuthenticated, isStarting, isSending, error, onStart, onSend }: InterviewPanelProps) {
  const [draft, setDraft] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messageCount = session?.messages?.length ?? 0;

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messageCount, pendingMessage]);

  if (!session) {
    return (
      <div className="rounded-lg border border-primary-soft-border bg-primary-soft/60 p-4">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary-text" aria-hidden="true" />
          <div>
            <h4 className="text-sm font-semibold text-fg">Strengthen this evidence</h4>
            <p className="mt-1 text-sm text-fg-muted">
              Answer a few questions from our AI coach about how you used this skill, and get a verified STAR bullet
              you can paste into your resume.
            </p>
          </div>
        </div>
        <Button
          fullWidth
          className="mt-4"
          onClick={onStart}
          isLoading={isStarting}
          loadingText="Starting AI interview..."
        >
          {isAuthenticated ? (
            <>
              <Sparkles aria-hidden="true" />
              Start AI interview
            </>
          ) : (
            <>
              <Lock aria-hidden="true" />
              Sign in to start AI interview
            </>
          )}
        </Button>
        {error && <Alert className="mt-3">{error}</Alert>}
      </div>
    );
  }

  const isActive = session.status === "active";

  const submit = async () => {
    const text = draft;
    if (!text.trim() || isSending) return;
    setDraft("");
    setPendingMessage(text);
    const delivered = await onSend(text);
    setPendingMessage(null);
    if (!delivered) setDraft(text);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/60 px-4 py-2.5">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-fg">
          <Bot className="size-4 shrink-0 text-primary-text" aria-hidden="true" />
          <span className="truncate">AI interview: {session.skill_name}</span>
        </p>
        <Badge tone={isActive ? "info" : session.status === "completed" ? "success" : "neutral"} size="sm" className="capitalize">
          {session.status}
        </Badge>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[26rem] min-h-48 space-y-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-label="Interview messages"
      >
        {(session.messages || []).map((message) => (
          <ChatBubble key={message.id} role={message.role}>
            {renderInlineMarkdown(message.content)}
          </ChatBubble>
        ))}
        {pendingMessage && (
          <ChatBubble role="user" pending>
            {pendingMessage}
          </ChatBubble>
        )}
        {isSending && (
          <div className="flex items-center gap-1.5 px-1 text-fg-subtle" aria-label="AI coach is typing">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="size-1.5 animate-bounce rounded-full bg-current"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {session.generated_bullet && (
        <div className="border-t border-success-border bg-success-soft px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-success">Your STAR bullet</p>
            <CopyButton text={session.generated_bullet} label="Copy bullet" variant="ghost" />
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-fg">{session.generated_bullet}</p>
        </div>
      )}

      {isActive && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="border-t border-border p-3"
        >
          <div className="flex items-end gap-2">
            <label htmlFor="interview-reply" className="sr-only">
              Your answer
            </label>
            <textarea
              id="interview-reply"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Describe exactly what you built, how, and the outcome..."
              className="max-h-40 min-h-10 flex-1 resize-y rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/40"
            />
            <Button type="submit" size="icon" disabled={isSending || !draft.trim()} aria-label="Send answer">
              <Send />
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-fg-subtle">Enter to send · Shift + Enter for a new line</p>
          {error && <Alert className="mt-3">{error}</Alert>}
        </form>
      )}
      {!isActive && error && <Alert className="m-3">{error}</Alert>}
    </div>
  );
}

function ChatBubble({ role, pending, children }: { role: string; pending?: boolean; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-surface-2 text-fg",
          pending && "opacity-70"
        )}
      >
        <span className="sr-only">{isUser ? "You: " : "AI coach: "}</span>
        {children}
      </div>
    </div>
  );
}

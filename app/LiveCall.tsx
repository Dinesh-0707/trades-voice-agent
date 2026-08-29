"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

type JobState = {
  reference: string;
  issue: string | null;
  urgency: string;
  status: string;
  eta: string | null;
  crmStatus: string;
  crmRef: string | null;
  customer: { name: string; phone: string | null } | null;
  technician: { name: string } | null;
} | null;

function newSessionId() {
  return `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export default function LiveCall() {
  const [sessionId] = useState(newSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Thanks for calling Apex Plumbing & Heating, this is Ring. What's going on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [job, setJob] = useState<JobState>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      setJob(data.job);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, something went wrong reaching Ring. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex flex-col h-[520px]">
        <div className="px-4 py-3 border-b border-white/10 bg-white/[0.03]">
          <p className="text-sm font-semibold text-zinc-100">Talk to Ring</p>
          <p className="text-xs text-zinc-500">Live agent — type like you&rsquo;re calling in</p>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl border px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "assistant"
                  ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-100 self-start"
                  : "bg-white/5 border-white/10 text-zinc-100 self-end"
              }`}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div className="max-w-[85%] rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-zinc-500 self-start">
              Ring is typing…
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Describe what's happening…"
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={send}
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-cyan-400 text-zinc-950 text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 h-[520px] flex flex-col">
        <p className="text-sm font-semibold text-zinc-100 mb-1">Live job record</p>
        <p className="text-xs text-zinc-500 mb-4">Real database, updated as Ring books the job</p>

        {!job ? (
          <p className="text-sm text-zinc-600">
            Nothing booked yet — describe an issue on the left and Ring will triage and book it.
          </p>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <Field label="Reference" value={job.reference} />
            <Field label="Customer" value={job.customer?.name ?? undefined} />
            <Field label="Issue" value={job.issue ?? undefined} />
            <Field label="Urgency" value={job.urgency} highlight={job.urgency === "EMERGENCY"} />
            <Field label="Technician" value={job.technician?.name ?? "Unassigned"} />
            <Field label="ETA" value={job.eta ?? undefined} />
            <div className="mt-auto pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">CRM sync</p>
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">
                {job.crmStatus} {job.crmRef ? `· ${job.crmRef}` : ""}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2">
      <span className="text-xs text-zinc-500 pt-0.5 shrink-0">{label}</span>
      <span
        className={`text-right text-sm ${
          value ? (highlight ? "text-red-400 font-semibold" : "text-zinc-100") : "text-zinc-700"
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

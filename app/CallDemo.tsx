"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { scenarios, type DashboardPatch } from "./data";

const SPEAKER_STYLE: Record<string, string> = {
  agent: "bg-cyan-500/10 border-cyan-400/30 text-cyan-100 self-start",
  caller: "bg-white/5 border-white/10 text-zinc-100 self-end",
  system: "bg-amber-400/10 border-amber-300/30 text-amber-100 self-center text-xs italic",
};

const SPEAKER_LABEL: Record<string, string> = {
  agent: "Ring (AI agent)",
  caller: "Caller",
  system: "System",
};

export default function CallDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scenario = scenarios[scenarioIndex];
  const lines = scenario.lines;

  const dashboard = useMemo(() => {
    const acc: DashboardPatch = {};
    for (let i = 0; i <= step && i < lines.length; i++) {
      Object.assign(acc, lines[i].patch);
    }
    return acc;
  }, [step, lines]);

  useEffect(() => {
    if (!playing) return;
    if (step >= lines.length - 1) return;
    const delay = lines[step]?.speaker === "system" ? 1400 : 2200;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, playing, lines]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [step]);

  function selectScenario(i: number) {
    setScenarioIndex(i);
    setStep(0);
    setPlaying(true);
  }

  function replay() {
    setStep(0);
    setPlaying(true);
  }

  const visibleLines = lines.slice(0, step + 1);
  const done = step >= lines.length - 1;

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => selectScenario(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              i === scenarioIndex
                ? "bg-cyan-400 text-zinc-950 border-cyan-400"
                : "bg-white/5 text-zinc-300 border-white/10 hover:border-white/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex flex-col h-[480px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
            <div>
              <p className="text-sm font-semibold text-zinc-100">Live call transcript</p>
              <p className="text-xs text-zinc-500">{scenario.tagline}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {done ? "call ended" : "live"}
            </span>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
            {visibleLines.map((line, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl border px-3.5 py-2 text-sm leading-relaxed ${SPEAKER_STYLE[line.speaker]}`}
              >
                <p className="text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                  {SPEAKER_LABEL[line.speaker]}
                </p>
                {line.text}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/10 flex justify-end">
            <button
              onClick={replay}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition"
            >
              ↺ Replay call
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 h-[480px] flex flex-col">
          <p className="text-sm font-semibold text-zinc-100 mb-1">Auto-generated job record</p>
          <p className="text-xs text-zinc-500 mb-4">Written live as the call happens — zero manual entry</p>

          <div className="flex flex-col gap-3 text-sm">
            <Field label="Customer" value={dashboard.customer} />
            <Field label="Phone" value={dashboard.phone} />
            <Field label="Issue" value={dashboard.issue} />
            <Field
              label="Urgency"
              value={dashboard.urgency}
              highlight={dashboard.urgency === "EMERGENCY"}
            />
            <Field label="Scheduled" value={dashboard.slot} />
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">
              {scenario.crmName} sync
            </p>
            <div
              className={`rounded-lg border px-3 py-2 text-xs transition ${
                dashboard.crm
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 bg-white/[0.02] text-zinc-600"
              }`}
            >
              {dashboard.crm ?? "Waiting for job details…"}
            </div>
            {dashboard.note && (
              <p className="mt-2 text-xs text-cyan-300/90">✦ {dashboard.note}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
}) {
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

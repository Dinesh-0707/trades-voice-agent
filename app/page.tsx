import CallDemo from "./CallDemo";

const PROBLEMS = [
  {
    stat: "50%",
    title: "of calls go unanswered",
    body: "Trucks are loud, hands are full of pipe — a ringing phone loses to the job in front of you.",
  },
  {
    stat: "$0",
    title: "revenue from a missed call",
    body: "A missed call isn't a missed conversation — it's a booked job that just went to a competitor.",
  },
  {
    stat: "No follow-up",
    title: "= no repeat work",
    body: "Quotes go cold, jobs don't get re-booked, and there's no one chasing the ones that got away.",
  },
];

const FEATURES = [
  {
    title: "Answers instantly, 24/7",
    body: "Every call is picked up in under a second — nights, weekends, mid-job — no voicemail, ever.",
  },
  {
    title: "Triages emergencies",
    body: "Recognizes urgent language (burst pipe, no heat, gas smell) and escalates or dispatches immediately.",
  },
  {
    title: "Books the job",
    body: "Checks real availability and puts the customer on the schedule while they're still on the phone.",
  },
  {
    title: "Syncs to ServiceTitan / Jobber",
    body: "Job, contact, and notes are written straight into your CRM — no double entry, no lost details.",
  },
  {
    title: "Captures lead details automatically",
    body: "Name, address, issue, and urgency are transcribed and structured the moment the call ends.",
  },
  {
    title: "Chases unaccepted quotes",
    body: "Proactively calls or texts customers sitting on a quote, and closes the ones ready to move.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08),_transparent_60%)]" />

      <header className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="inline-flex items-center gap-2 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded-full px-3 py-1 mb-6">
          Built for HVAC · Plumbing · Roofing
        </p>
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
          Every missed call is a job<br className="hidden sm:block" /> you paid to lose.
        </h1>
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
          Ring is an AI voice agent that answers every call instantly, triages emergencies,
          books the job, and syncs it straight to your CRM — so no lead, and no repeat customer, slips away.
        </p>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-3xl font-semibold text-red-400 mb-2">{p.stat}</p>
              <p className="text-sm font-semibold text-zinc-100">{p.title}</p>
              <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">See it handle a real call</h2>
          <p className="text-zinc-500 mt-2">Switch scenarios below — the job record fills itself in as the call happens.</p>
        </div>
        <CallDemo />
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">What Ring does on every call</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-semibold text-cyan-300">{f.title}</p>
              <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative max-w-6xl mx-auto px-6 pb-20 text-center">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] px-8 py-12">
          <h2 className="text-2xl font-semibold text-white">Stop losing jobs to a ringing phone.</h2>
          <p className="text-zinc-400 mt-2 max-w-xl mx-auto">
            This is a portfolio demo of an AI voice agent concept for home service trades —
            built to show the end-to-end flow from call to booked, synced job.
          </p>
        </div>
      </footer>
    </div>
  );
}

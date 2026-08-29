import { prisma } from "@/lib/prisma";
import { logoutOfDispatch, markJobComplete } from "@/app/actions/dispatch";

export default async function DispatchPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, technician: true },
  });
  const quotes = await prisma.quote.findMany({
    orderBy: { sentAt: "desc" },
    include: { customer: true },
  });

  const active = jobs.filter((j) => j.status !== "COMPLETED");
  const completed = jobs.filter((j) => j.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-[#0a0e14] text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 mb-2">
              Apex Plumbing & Heating
            </p>
            <h1 className="text-3xl font-semibold">Dispatch board</h1>
          </div>
          <form action={logoutOfDispatch}>
            <button className="text-xs text-zinc-500 border border-white/10 rounded-lg px-3 py-2 hover:border-white/30">
              Sign out
            </button>
          </form>
        </div>

        <section className="mb-14">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Active jobs ({active.length})
          </h2>
          {active.length === 0 ? (
            <p className="text-sm text-zinc-600">No active jobs.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {active.map((job) => (
                <div key={job.id} className="border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-zinc-500">
                        {job.reference} · {job.urgency} · {job.status}
                      </p>
                      <p className="text-sm text-zinc-100 mt-1">
                        {job.customer?.name ?? "Unknown customer"} — {job.issue ?? "No description"}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Tech: {job.technician?.name ?? "Unassigned"} · {job.eta ?? "No ETA set"}
                      </p>
                      <p className="text-xs text-emerald-500 mt-1">
                        CRM: {job.crmStatus.toLowerCase()} {job.crmRef ? `(${job.crmRef})` : ""}
                      </p>
                    </div>
                    <form action={markJobComplete.bind(null, job.id)}>
                      <button className="text-xs bg-cyan-400 text-zinc-950 rounded-lg px-3 py-1.5 font-medium shrink-0">
                        Mark complete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-14">
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Quotes ({quotes.length})
          </h2>
          {quotes.length === 0 ? (
            <p className="text-sm text-zinc-600">No quotes on file.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {quotes.map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between text-sm border-b border-white/5 py-2"
                >
                  <span className="text-zinc-400">
                    {q.customer?.name ?? "—"} — {q.description} (${(q.amountCents / 100).toFixed(0)})
                  </span>
                  <span
                    className={
                      q.status === "ACCEPTED"
                        ? "text-emerald-500"
                        : q.status === "DECLINED"
                        ? "text-red-500"
                        : "text-amber-400"
                    }
                  >
                    {q.status.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">
            Completed ({completed.length})
          </h2>
          {completed.length === 0 ? (
            <p className="text-sm text-zinc-600">Nothing completed yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {completed.map((job) => (
                <div key={job.id} className="text-sm text-zinc-500 border-b border-white/5 py-2">
                  {job.reference} — {job.customer?.name ?? "—"} — {job.issue}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

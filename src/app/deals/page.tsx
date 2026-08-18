import { prisma } from "@/lib/prisma";
import { createDeal, createActivity } from "@/lib/actions";
import { DealStageControl, DeleteDealButton } from "@/components/DealControls";
export const dynamic = "force-dynamic";
export default async function DealsPage() {
  const [deals, companies, contacts] = await Promise.all([
    prisma.deal.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        company: true,
        contact: true,
        activities: { orderBy: { activityDate: "desc" }, take: 3 },
      },
    }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.contact.findMany({ orderBy: { firstName: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-mono-data text-[var(--slate)] uppercase tracking-wide mb-1">
            deals table
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        </div>
        <span className="text-sm text-[var(--slate)] font-mono-data">
          {deals.length} rows
        </span>
      </div>

      <form
        action={createDeal}
        className="p-5 rounded-lg border border-[var(--line)] bg-[var(--panel)] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
      >
        <div className="sm:col-span-2">
          <label className="text-xs text-[var(--slate)] block mb-1">Deal title</label>
          <input
            name="title"
            required
            placeholder="Acme — Annual contract"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Amount ($)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            placeholder="12000"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Company</label>
          <select
            name="companyId"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] bg-white"
          >
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Contact</label>
          <select
            name="contactId"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] bg-white"
          >
            <option value="">—</option>
            {contacts.map((c) => (
              <option key={c.contactId} value={c.contactId}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="sm:col-span-5 justify-self-start px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Create deal
        </button>
      </form>

      <div className="space-y-3">
        {deals.map((d) => (
          <div
            key={d.dealId}
            className="p-4 rounded-lg border border-[var(--line)] bg-[var(--panel)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono-data text-xs text-[var(--slate)]">
                    #{d.dealId}
                  </span>
                  <p className="font-medium truncate">{d.title}</p>
                </div>
                <p className="text-sm text-[var(--slate)] mt-1">
                  {d.company?.name ?? "No company"}
                  {d.contact && ` · ${d.contact.firstName} ${d.contact.lastName}`}
                  {d.amount && ` · $${Number(d.amount).toLocaleString()}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <DealStageControl dealId={d.dealId} stage={d.stage} />
                <DeleteDealButton dealId={d.dealId} />
              </div>
            </div>

            <details className="mt-3">
              <summary className="text-xs text-[var(--slate)] cursor-pointer hover:text-[var(--ink)]">
                Log activity ({d.activities.length} recent)
              </summary>
              <div className="mt-3 space-y-2">
                {d.activities.map((a) => (
                  <div key={a.activityId} className="text-xs text-[var(--slate)] pl-3 border-l-2 border-[var(--line)]">
                    <span className="font-mono-data uppercase">{a.type}</span>
                    {a.notes && ` — ${a.notes}`}
                  </div>
                ))}
                <form action={createActivity} className="flex gap-2 mt-2">
                  <input type="hidden" name="dealId" value={d.dealId} />
                  <input type="hidden" name="contactId" value={d.contactId ?? ""} />
                  <select
                    name="type"
                    className="text-xs rounded-md border border-[var(--line)] px-2 py-1.5 bg-white"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                  <input
                    name="notes"
                    placeholder="Quick note..."
                    className="flex-1 text-xs rounded-md border border-[var(--line)] px-2 py-1.5 outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-md bg-[var(--ink)] text-white hover:opacity-90 transition-opacity"
                  >
                    Log
                  </button>
                </form>
              </div>
            </details>
          </div>
        ))}
        {deals.length === 0 && (
          <div className="p-8 text-center text-[var(--slate)] rounded-lg border border-[var(--line)] bg-[var(--panel)]">
            No deals yet. Create one above.
          </div>
        )}
      </div>
    </div>
  );
}

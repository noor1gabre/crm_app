import { prisma } from "@/lib/prisma";
import { createCompany } from "@/lib/actions";
export const dynamic = "force-dynamic";
export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true, deals: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-mono-data text-[var(--slate)] uppercase tracking-wide mb-1">
            companies table
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
        </div>
        <span className="text-sm text-[var(--slate)] font-mono-data">
          {companies.length} rows
        </span>
      </div>

      <form
        action={createCompany}
        className="p-5 rounded-lg border border-[var(--line)] bg-[var(--panel)] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
      >
        <div className="sm:col-span-2">
          <label className="text-xs text-[var(--slate)] block mb-1">Company name</label>
          <input
            name="name"
            required
            placeholder="Acme Corp"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Industry</label>
          <input
            name="industry"
            placeholder="SaaS"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Website</label>
          <input
            name="website"
            placeholder="acme.com"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-4 justify-self-start px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add company
        </button>
      </form>

      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-xs text-[var(--slate)] font-mono-data">
              <th className="px-4 py-3 font-medium">id</th>
              <th className="px-4 py-3 font-medium">name</th>
              <th className="px-4 py-3 font-medium">industry</th>
              <th className="px-4 py-3 font-medium">website</th>
              <th className="px-4 py-3 font-medium">contacts</th>
              <th className="px-4 py-3 font-medium">deals</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.companyId} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-3 font-mono-data text-[var(--slate)]">{c.companyId}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-[var(--slate)]">{c.industry ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--slate)]">{c.website ?? "—"}</td>
                <td className="px-4 py-3">{c._count.contacts}</td>
                <td className="px-4 py-3">{c._count.deals}</td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--slate)]">
                  No companies yet. Add one above to write your first row.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { createContact } from "@/lib/actions";
export const dynamic = "force-dynamic";
export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      include: { company: true },
    }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-mono-data text-[var(--slate)] uppercase tracking-wide mb-1">
            contacts table
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">People</h1>
        </div>
        <span className="text-sm text-[var(--slate)] font-mono-data">
          {contacts.length} rows
        </span>
      </div>

      <form
        action={createContact}
        className="p-5 rounded-lg border border-[var(--line)] bg-[var(--panel)] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
      >
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">First name</label>
          <input
            name="firstName"
            required
            placeholder="Jane"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Last name</label>
          <input
            name="lastName"
            required
            placeholder="Doe"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Email</label>
          <input
            name="email"
            type="email"
            placeholder="jane@acme.com"
            className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--slate)] block mb-1">Phone</label>
          <input
            name="phone"
            placeholder="555-0100"
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
        <button
          type="submit"
          className="sm:col-span-5 justify-self-start px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add contact
        </button>
      </form>

      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-xs text-[var(--slate)] font-mono-data">
              <th className="px-4 py-3 font-medium">id</th>
              <th className="px-4 py-3 font-medium">name</th>
              <th className="px-4 py-3 font-medium">email</th>
              <th className="px-4 py-3 font-medium">phone</th>
              <th className="px-4 py-3 font-medium">company</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.contactId} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-3 font-mono-data text-[var(--slate)]">{c.contactId}</td>
                <td className="px-4 py-3 font-medium">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-4 py-3 text-[var(--slate)]">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--slate)]">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-[var(--slate)]">{c.company?.name ?? "—"}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--slate)]">
                  No contacts yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

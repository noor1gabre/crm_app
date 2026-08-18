import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-mono-data text-[var(--slate)] uppercase tracking-wide mb-2">
          Module 1 · OLTP source
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Coil CRM</h1>
        <p className="text-[var(--slate)] mt-2 max-w-xl">
          A minimal CRM writing directly to RDS PostgreSQL. Every create, stage
          change, and delete here becomes a row in the WAL — the raw material
          for the CDC pipeline you&apos;ll build in Module 2.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/companies"
          className="block p-5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--accent)] transition-colors"
        >
          <p className="text-xs font-mono-data text-[var(--slate)]">companies</p>
          <p className="text-lg font-medium mt-1">Accounts</p>
          <p className="text-sm text-[var(--slate)] mt-1">Organizations you sell to</p>
        </Link>
        <Link
          href="/contacts"
          className="block p-5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--accent)] transition-colors"
        >
          <p className="text-xs font-mono-data text-[var(--slate)]">contacts</p>
          <p className="text-lg font-medium mt-1">People</p>
          <p className="text-sm text-[var(--slate)] mt-1">Individuals at those accounts</p>
        </Link>
        <Link
          href="/deals"
          className="block p-5 rounded-lg border border-[var(--line)] bg-[var(--panel)] hover:border-[var(--accent)] transition-colors"
        >
          <p className="text-xs font-mono-data text-[var(--slate)]">deals</p>
          <p className="text-lg font-medium mt-1">Pipeline</p>
          <p className="text-sm text-[var(--slate)] mt-1">Opportunities moving through stages</p>
        </Link>
      </div>

      <div className="p-4 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm">
        <span className="font-mono-data text-[var(--accent)]">tip —</span>{" "}
        Move deals through stages on the Deals page to generate UPDATE events.
        That&apos;s the exact traffic your Silver/ODS merge logic will need to handle correctly.
      </div>
    </div>
  );
}

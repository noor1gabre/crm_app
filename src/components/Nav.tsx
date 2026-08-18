import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--panel)]">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-bold font-mono-data">C</span>
          </div>
          <span className="font-semibold tracking-tight">Coil CRM</span>
          <span className="text-xs text-[var(--slate)] font-mono-data ml-2">
            source-of-truth · rds-postgres
          </span>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link href="/companies" className="text-[var(--slate)] hover:text-[var(--ink)] transition-colors">
            Companies
          </Link>
          <Link href="/contacts" className="text-[var(--slate)] hover:text-[var(--ink)] transition-colors">
            Contacts
          </Link>
          <Link href="/deals" className="text-[var(--slate)] hover:text-[var(--ink)] transition-colors">
            Deals
          </Link>
        </nav>
      </div>
    </header>
  );
}

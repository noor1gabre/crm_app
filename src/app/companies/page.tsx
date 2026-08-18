"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createCompany } from "@/lib/actions";

interface Company {
  companyId: number;
  name: string;
  industry: string | null;
  website: string | null;
  createdAt: string;
  _count: { contacts: number; deals: number };
}

interface PageData {
  rows: Company[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_SIZE = 15;

function TableSkeleton() {
  return (
    <>
      {[0,1,2,3,4,5].map((i) => (
        <tr key={i}>
          {[80, 160, 100, 140, 50, 50].map((w, j) => (
            <td key={j} style={{ padding: "14px 16px" }}>
              <div className="skeleton" style={{ width: w, height: 13, borderRadius: 3 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function CompaniesPage() {
  const [data, setData]       = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback((q: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ q, page: String(p), limit: String(PAGE_SIZE) });
    fetch(`/api/companies?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  useEffect(() => { load(query, page); }, [page, load]);  // eslint-disable-line

  const onSearch = (v: string) => {
    setQuery(v);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v, 1), 300);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createCompany(formData);
      setShowModal(false);
      formRef.current?.reset();
      load(query, page);
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Accounts</h1>
          <p className="page-header-sub">
            {data ? `${data.total.toLocaleString()} total records` : "Loading…"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Account
        </button>
      </div>

      {/* Table card */}
      <div className="card">
        {/* Search bar */}
        <div className="table-search">
          <div className="table-search-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or industry…"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-secondary)" }}>
            {loading ? "Loading…" : `${data?.total ?? 0} results`}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Account Name</th>
                <th>Industry</th>
                <th>Website</th>
                <th>Contacts</th>
                <th>Deals</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15l.75 7.5H3.75L4.5 3zM9 21V10.5m6 0V21" /></svg>
                      <p>No accounts found. Try a different search or add one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.rows.map((c) => (
                  <tr key={c.companyId}>
                    <td><span className="text-mono" style={{ color: "var(--ink-secondary)" }}>#{c.companyId}</span></td>
                    <td><span style={{ fontWeight: 500 }}>{c.name}</span></td>
                    <td>
                      {c.industry
                        ? <span className="badge badge-blue">{c.industry}</span>
                        : <span style={{ color: "var(--ink-muted)" }}>—</span>}
                    </td>
                    <td>
                      {c.website
                        ? <a href={`https://${c.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", fontSize: 12, textDecoration: "none" }}>{c.website}</a>
                        : <span style={{ color: "var(--ink-muted)" }}>—</span>}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{c._count.contacts}</span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{c._count.deals}</span>
                    </td>
                    <td style={{ color: "var(--ink-secondary)", fontSize: 12 }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">
            Page {page} of {totalPages} · {data?.total ?? 0} total
          </span>
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >←</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const num = start + i;
            return (
              <button
                key={num}
                className={`page-btn${num === page ? " active" : ""}`}
                onClick={() => setPage(num)}
                disabled={loading}
              >{num}</button>
            );
          })}
          <button
            className="page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >→</button>
        </div>
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Account</h2>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form ref={formRef} action={handleCreate}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="form-label">Company Name *</label>
                  <input name="name" required placeholder="Acme Corp" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Industry</label>
                  <input name="industry" placeholder="SaaS, Fintech, Retail…" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Website</label>
                  <input name="website" placeholder="acme.com" className="form-input" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Saving…" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

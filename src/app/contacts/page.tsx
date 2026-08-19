"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createContact, updateContact } from "@/lib/actions";

interface Contact {
  contactId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  company: { name: string } | null;
  companyId: number | null;
}

interface PageData { rows: Contact[]; total: number; page: number; limit: number; }

const PAGE_SIZE = 15;

function TableSkeleton() {
  return (
    <>
      {[0,1,2,3,4,5].map((i) => (
        <tr key={i}>
          {[60, 140, 180, 110, 130, 90].map((w, j) => (
            <td key={j} style={{ padding: "14px 16px" }}>
              <div className="skeleton" style={{ width: w, height: 13, borderRadius: 3 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function Initials({ first, last }: { first: string; last: string }) {
  const colors = ["var(--blue)", "var(--purple)", "var(--green)", "var(--amber)"];
  const c = colors[(first.charCodeAt(0) + last.charCodeAt(0)) % colors.length];
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%", background: c,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: 11, fontWeight: 600, flexShrink: 0
    }}>
      {first[0]}{last[0]}
    </div>
  );
}

export default function ContactsPage() {
  const [data, setData]       = useState<PageData | null>(null);
  const [companies, setCompanies] = useState<{ companyId: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [page, setPage]       = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback((q: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ q, page: String(p), limit: String(PAGE_SIZE) });
    fetch(`/api/contacts?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  useEffect(() => {
    load(query, page);
    fetch("/api/companies?limit=200")
      .then((r) => r.json())
      .then((d) => setCompanies(d.rows));
  }, [page, load]); // eslint-disable-line

  const onSearch = (v: string) => {
    setQuery(v);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v, 1), 300);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createContact(formData);
      closeModal();
      load(query, page);
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editingContact) return;
    startTransition(async () => {
      await updateContact(editingContact.contactId, formData);
      closeModal();
      load(query, page);
    });
  };

  const openEdit = (c: Contact) => {
    setEditingContact(c);
    setShowModal(true);
  };
  const closeModal = () => {
    setEditingContact(null);
    setShowModal(false);
    formRef.current?.reset();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Contacts</h1>
          <p className="page-header-sub">
            {data ? `${data.total.toLocaleString()} total records` : "Loading…"}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingContact(null); setShowModal(true); }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Contact
        </button>
      </div>

      <div className="card">
        <div className="table-search">
          <div className="table-search-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-secondary)" }}>
            {loading ? "Loading…" : `${data?.total ?? 0} results`}
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Account</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      <p>No contacts found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.rows.map((c) => (
                  <tr key={c.contactId}>
                    <td><span className="text-mono" style={{ color: "var(--ink-secondary)" }}>#{c.contactId}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Initials first={c.firstName} last={c.lastName} />
                        <span style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--blue)", fontSize: 12 }}>{c.email ?? <span style={{ color: "var(--ink-muted)" }}>—</span>}</td>
                    <td style={{ fontSize: 12, color: "var(--ink-secondary)" }}>{c.phone ?? <span style={{ color: "var(--ink-muted)" }}>—</span>}</td>
                    <td>
                      {c.company
                        ? <span className="badge badge-neutral">{c.company.name}</span>
                        : <span style={{ color: "var(--ink-muted)" }}>—</span>}
                    </td>
                    <td style={{ color: "var(--ink-secondary)", fontSize: 12 }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="icon-btn" onClick={() => openEdit(c)} data-tooltip="Edit contact">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">Page {page} of {totalPages} · {data?.total ?? 0} total</span>
          <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>←</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const num = start + i;
            return <button key={num} className={`page-btn${num === page ? " active" : ""}`} onClick={() => setPage(num)} disabled={loading}>{num}</button>;
          })}
          <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>→</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingContact ? "Edit Contact" : "New Contact"}</h2>
              <button className="icon-btn" onClick={closeModal}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form ref={formRef} action={editingContact ? handleUpdate : handleCreate}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="form-label">First Name *</label>
                  <input name="firstName" required defaultValue={editingContact?.firstName ?? ""} placeholder="Jane" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" required defaultValue={editingContact?.lastName ?? ""} placeholder="Doe" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input name="email" type="email" defaultValue={editingContact?.email ?? ""} placeholder="jane@acme.com" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input name="phone" defaultValue={editingContact?.phone ?? ""} placeholder="555-0100" className="form-input" />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Account</label>
                  <select name="companyId" className="form-select" defaultValue={editingContact?.companyId?.toString() ?? ""}>
                    <option value="">— None —</option>
                    {companies.map((c) => (
                      <option key={c.companyId} value={c.companyId}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? "Saving…" : editingContact ? "Save Changes" : "Create Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

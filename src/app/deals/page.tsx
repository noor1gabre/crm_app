"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createDeal, createActivity, updateDealStage, deleteDeal, updateDeal, deleteActivity, updateActivity } from "@/lib/actions";

interface Activity { activityId: number; type: string; notes: string | null; activityDate: string; }
interface Deal {
  dealId: number;
  contactId: number | null;
  companyId: number | null;
  title: string;
  stage: string;
  amount: string | null;
  closeDate: string | null;
  updatedAt: string;
  company: { name: string } | null;
  contact: { firstName: string; lastName: string } | null;
  activities: Activity[];
}
interface PageData { rows: Deal[]; total: number; page: number; limit: number; }

const STAGES = ["prospecting", "qualified", "proposal", "won", "lost"] as const;
const STAGE_LABEL: Record<string, string> = {
  prospecting: "Prospecting", qualified: "Qualified", proposal: "Proposal", won: "Won", lost: "Lost"
};

const PAGE_SIZE = 10;

function fmt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n/1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function TableSkeleton() {
  return (
    <>
      {[0,1,2,3,4].map((i) => (
        <tr key={i}>
          {[60, 200, 90, 100, 120, 80, 80, 80].map((w, j) => (
            <td key={j} style={{ padding: "14px 16px" }}>
              <div className="skeleton" style={{ width: w, height: 13, borderRadius: 3 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function StageBadge({ stage }: { stage: string }) {
  return <span className={`badge stage-${stage}`}>{STAGE_LABEL[stage] ?? stage}</span>;
}

function StageSelector({ dealId, stage, onChanged }: { dealId: number; stage: string; onChanged: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select
      value={stage}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await updateDealStage(dealId, next);
          onChanged();
        });
      }}
      className={`badge stage-${stage}`}
      style={{ border: "none", outline: "none", cursor: "pointer", fontWeight: 600, fontSize: 11 }}
    >
      {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
    </select>
  );
}

function DeleteBtn({ dealId, onDeleted }: { dealId: number; onDeleted: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="icon-btn"
      disabled={isPending}
      style={{ color: "var(--red)" }}
      data-tooltip="Delete deal"
      onClick={() => {
        if (!confirm("Delete this deal? This generates a CDC DELETE event.")) return;
        startTransition(async () => { await deleteDeal(dealId); onDeleted(); });
      }}
    >
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  );
}

function ActivityRow({ a, onDeleted, onUpdated }: { a: Activity, onDeleted: () => void, onUpdated: () => void }) {
  const COLOR: Record<string, string> = { call: "var(--blue)", email: "var(--purple)", meeting: "var(--green)", note: "var(--amber)" };
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      await updateActivity(a.activityId, formData);
      setIsEditing(false);
      onUpdated();
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this activity?")) return;
    startTransition(async () => {
      await deleteActivity(a.activityId);
      onDeleted();
    });
  };

  if (isEditing) {
    return (
      <form action={handleUpdate} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: 12 }}>
        <select name="type" className="form-select" style={{ fontSize: 12, padding: "2px 6px" }} defaultValue={a.type}>
          <option value="call">📞</option>
          <option value="email">✉️</option>
          <option value="meeting">🤝</option>
          <option value="note">📝</option>
        </select>
        <input name="notes" defaultValue={a.notes || ""} className="form-input" style={{ fontSize: 12, flex: 1, padding: "2px 6px" }} />
        <button type="submit" className="btn btn-primary" style={{ padding: "2px 8px" }} disabled={isPending}>Save</button>
        <button type="button" className="btn btn-secondary" style={{ padding: "2px 8px" }} onClick={() => setIsEditing(false)}>Cancel</button>
      </form>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: 12, position: "relative" }} className="group">
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLOR[a.type] ?? "var(--ink-muted)", marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 500, textTransform: "capitalize", color: COLOR[a.type] }}>{a.type}</span>
        {a.notes && <span style={{ color: "var(--ink-secondary)" }}> — {a.notes}</span>}
        <div style={{ color: "var(--ink-muted)", fontSize: 10 }}>{new Date(a.activityDate).toLocaleDateString()}</div>
      </div>
      <div style={{ display: "flex", gap: 4, opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={() => setIsEditing(true)} className="icon-btn" style={{ padding: 2 }}><svg width="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
        <button type="button" onClick={handleDelete} className="icon-btn" style={{ padding: 2, color: "var(--red)" }} disabled={isPending}><svg width="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const [data, setData]         = useState<PageData | null>(null);
  const [companies, setCompanies] = useState<{ companyId: number; name: string }[]>([]);
  const [contacts, setContacts]   = useState<{ contactId: number; firstName: string; lastName: string; companyId: number | null }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [expandedDeal, setExpandedDeal] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback((q: string, stage: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ q, stage, page: String(p), limit: String(PAGE_SIZE) });
    fetch(`/api/deals?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  useEffect(() => {
    load(query, stageFilter, page);
    Promise.all([
      fetch("/api/companies?limit=200").then((r) => r.json()),
      fetch("/api/contacts?limit=200").then((r) => r.json()),
    ]).then(([c, ct]) => { setCompanies(c.rows); setContacts(ct.rows); });
  }, [page, load]); // eslint-disable-line

  const onSearch = (v: string) => {
    setQuery(v); setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v, stageFilter, 1), 300);
  };

  const onStageChange = (s: string) => {
    setStageFilter(s); setPage(1);
    load(query, s, 1);
  };

  const refresh = () => load(query, stageFilter, page);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createDeal(formData);
      closeModal();
      refresh();
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editingDeal) return;
    startTransition(async () => {
      await updateDeal(editingDeal.dealId, formData);
      closeModal();
      refresh();
    });
  };

  const openEdit = (d: Deal) => {
    setEditingDeal(d);
    setSelectedCompanyId(d.companyId?.toString() ?? "");
    setShowModal(true);
  };
  const closeModal = () => {
    setEditingDeal(null);
    setShowModal(false);
    setSelectedCompanyId("");
    formRef.current?.reset();
  };

  const handleLogActivity = (formData: FormData) => {
    startTransition(async () => {
      await createActivity(formData);
      refresh();
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Pipeline</h1>
          <p className="page-header-sub">
            {data ? `${data.total.toLocaleString()} deals` : "Loading…"}
            {stageFilter && ` · filtered by ${STAGE_LABEL[stageFilter]}`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingDeal(null); setShowModal(true); setSelectedCompanyId(""); }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Deal
        </button>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="table-search" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="table-search-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search deals…"
              value={query}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* Stage filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              className={`btn ${stageFilter === "" ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "4px 10px", fontSize: 12 }}
              onClick={() => onStageChange("")}
            >All</button>
            {STAGES.map((s) => (
              <button
                key={s}
                className={`badge stage-${s}`}
                style={{ cursor: "pointer", border: stageFilter === s ? "2px solid currentColor" : "2px solid transparent", padding: "3px 10px" }}
                onClick={() => onStageChange(stageFilter === s ? "" : s)}
              >{STAGE_LABEL[s]}</button>
            ))}
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
                <th>Deal Title</th>
                <th>Stage</th>
                <th>Value</th>
                <th>Account</th>
                <th>Contact</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" /></svg>
                      <p>No deals found. Create one to start your pipeline.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.rows.map((d) => (
                  <>
                    <tr key={d.dealId} style={{ cursor: "pointer" }} onClick={() => setExpandedDeal(expandedDeal === d.dealId ? null : d.dealId)}>
                      <td><span className="text-mono" style={{ color: "var(--ink-secondary)" }}>#{d.dealId}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg style={{ width: 14, height: 14, color: expandedDeal === d.dealId ? "var(--blue)" : "var(--ink-muted)", transition: "transform .2s", transform: expandedDeal === d.dealId ? "rotate(90deg)" : "none" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                          <span style={{ fontWeight: 500 }}>{d.title}</span>
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <StageSelector dealId={d.dealId} stage={d.stage} onChanged={refresh} />
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--green)" }}>{fmt(d.amount) ?? <span style={{ color: "var(--ink-muted)" }}>—</span>}</td>
                      <td>{d.company ? <span className="badge badge-neutral">{d.company.name}</span> : <span style={{ color: "var(--ink-muted)" }}>—</span>}</td>
                      <td style={{ fontSize: 12, color: "var(--ink-secondary)" }}>
                        {d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : "—"}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--ink-secondary)" }}>{new Date(d.updatedAt).toLocaleDateString()}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="icon-btn" onClick={() => openEdit(d)} data-tooltip="Edit deal">
                            <svg width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                          </button>
                          <DeleteBtn dealId={d.dealId} onDeleted={refresh} />
                        </div>
                      </td>
                    </tr>
                    {/* Expanded activity row */}
                    {expandedDeal === d.dealId && (
                      <tr key={`${d.dealId}-expanded`}>
                        <td colSpan={8} style={{ padding: "0 16px 16px 48px", background: "var(--bg)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 12 }}>
                            {/* Activities */}
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-secondary)" }}>
                                Recent Activities ({d.activities.length})
                              </div>
                              {d.activities.length === 0
                                ? <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>No activities yet.</div>
                                : d.activities.map((a) => <ActivityRow key={a.activityId} a={a} onDeleted={refresh} onUpdated={refresh} />)
                              }
                            </div>
                            {/* Log activity form */}
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-secondary)" }}>Log Activity</div>
                              <form action={handleLogActivity} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <input type="hidden" name="dealId" value={d.dealId} />
                                <input type="hidden" name="contactId" value={d.contactId ?? ""} />
                                <select name="type" className="form-select" style={{ fontSize: 12 }}>
                                  <option value="call">📞 Call</option>
                                  <option value="email">✉️ Email</option>
                                  <option value="meeting">🤝 Meeting</option>
                                  <option value="note">📝 Note</option>
                                </select>
                                <input name="notes" placeholder="Quick note…" className="form-input" style={{ fontSize: 12 }} />
                                <button type="submit" className="btn btn-primary" style={{ fontSize: 12, padding: "6px 12px", alignSelf: "flex-start" }} disabled={isPending}>
                                  {isPending ? "Logging…" : "Log Activity"}
                                </button>
                              </form>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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

      {/* New Deal Modal */}
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingDeal ? "Edit Deal" : "New Deal"}</h2>
              <button className="icon-btn" onClick={closeModal}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form ref={formRef} action={editingDeal ? handleUpdate : handleCreate}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Deal Title *</label>
                  <input name="title" required defaultValue={editingDeal?.title ?? ""} placeholder="Acme — Annual contract" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Amount ($)</label>
                  <input name="amount" type="number" step="0.01" defaultValue={editingDeal?.amount ?? ""} placeholder="12000" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Account</label>
                  <select 
                    name="companyId" 
                    className="form-select"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="">— None —</option>
                    {companies.map((c) => <option key={c.companyId} value={c.companyId}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Contact</label>
                  <select name="contactId" className="form-select" defaultValue={editingDeal?.contactId?.toString() ?? ""}>
                    <option value="">— None —</option>
                    {contacts
                      .filter(c => !selectedCompanyId || c.companyId === Number(selectedCompanyId))
                      .map((c) => <option key={c.contactId} value={c.contactId}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>{isPending ? "Saving…" : editingDeal ? "Save Changes" : "Create Deal"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import "./explorer.css";
import { updateDealStage } from "@/lib/actions";

/* ── Types ──────────────────────────────────────────────── */
interface Activity {
  activityId: number;
  type: string;
  notes: string | null;
  activityDate: string;
}
interface DealSnap { dealId: number; title: string; stage: string; amount: string | null; }
interface Contact {
  contactId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  activities: Activity[];
  deals: DealSnap[];
}
interface Deal {
  dealId: number;
  title: string;
  stage: string;
  amount: string | null;
  contact: { contactId: number; firstName: string; lastName: string } | null;
  activities: Activity[];
}
interface Company {
  companyId: number;
  name: string;
  industry: string | null;
  website: string | null;
  contacts: Contact[];
  deals: Deal[];
}

/* ── Helpers ────────────────────────────────────────────── */
const STAGES = ["prospecting","qualified","proposal","won","lost"] as const;
const STAGE_LABEL: Record<string,string> = { prospecting:"Prospecting", qualified:"Qualified", proposal:"Proposal", won:"Won", lost:"Lost" };

const ACT_COLOR: Record<string,string> = {
  call:"var(--blue)", email:"var(--purple)", meeting:"var(--green)", note:"var(--amber)"
};
const ACT_ICON: Record<string,string> = { call:"📞", email:"✉️", meeting:"🤝", note:"📝" };

const AVATAR_COLORS = ["#0176d3","#5c4ee5","#2e844a","#dd7a01","#c23934"];
function avatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }

function fmt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  if (n >= 1_000_000) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n/1e3).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}
function relDate(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30)  return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

/* ── ActivityTimeline ───────────────────────────────────── */
function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities.length)
    return <div style={{fontSize:11,color:"var(--ink-muted)",padding:"8px 0"}}>No activities yet.</div>;
  return (
    <div className="activity-timeline">
      {activities.map((a) => (
        <div key={a.activityId} className="timeline-item">
          <div className="timeline-dot" style={{ color: ACT_COLOR[a.type] ?? "var(--ink-muted)", background: ACT_COLOR[a.type]+"22" }}>
            <span>{ACT_ICON[a.type] ?? "•"}</span>
          </div>
          <div className="timeline-body">
            <div className="timeline-type" style={{ color: ACT_COLOR[a.type] }}>{a.type}</div>
            {a.notes && <div className="timeline-note">{a.notes}</div>}
            <div className="timeline-date">{relDate(a.activityDate)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── DealCard ───────────────────────────────────────────── */
function DealCard({ deal, highlighted, onStageChange }: {
  deal: Deal;
  highlighted: boolean;
  onStageChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`deal-card stage-${deal.stage}${highlighted ? " highlighted" : ""}`}>
      <div className="deal-card-header" onClick={() => setOpen((o) => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg className={`chevron${open?" open":""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
            <span className="deal-card-title">{deal.title}</span>
          </div>
          <div className="deal-card-meta">
            <span className={`badge stage-${deal.stage}`}>{STAGE_LABEL[deal.stage]}</span>
            {fmt(deal.amount) && <span className="deal-amount">{fmt(deal.amount)}</span>}
            {deal.contact && (
              <span style={{fontSize:11,color:"var(--ink-secondary)"}}>
                👤 {deal.contact.firstName} {deal.contact.lastName}
              </span>
            )}
            <span style={{fontSize:10,color:"var(--ink-muted)"}}>
              {deal.activities.length} activit{deal.activities.length===1?"y":"ies"}
            </span>
          </div>
        </div>
        {/* Stage selector */}
        <select
          value={deal.stage}
          disabled={isPending}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const next = e.target.value;
            startTransition(async () => { await updateDealStage(deal.dealId, next); onStageChange(); });
          }}
          className={`badge stage-${deal.stage}`}
          style={{ border:"none", outline:"none", cursor:"pointer", fontWeight:600, fontSize:11 }}
        >
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
        </select>
      </div>

      {open && <ActivityTimeline activities={deal.activities} />}
    </div>
  );
}

/* ── ContactChip ────────────────────────────────────────── */
function ContactChip({ contact, selected, onClick }: {
  contact: Contact;
  selected: boolean;
  onClick: () => void;
}) {
  const color = avatarColor(contact.firstName);
  return (
    <div className={`contact-chip${selected?" selected":""}`} onClick={onClick}>
      <div className="contact-avatar" style={{ background: color }}>
        {contact.firstName[0]}{contact.lastName[0]}
      </div>
      <div>
        <div className="contact-chip-name">{contact.firstName} {contact.lastName}</div>
        <div className="contact-chip-sub">
          {contact.deals.length} deal{contact.deals.length!==1?"s":""} · {contact.activities.length} act.
        </div>
      </div>
    </div>
  );
}

/* ── ContactPanel ───────────────────────────────────────── */
function ContactPanel({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const color = avatarColor(contact.firstName);
  return (
    <div className="contact-detail-panel">
      <div className="contact-detail-title">
        <div className="contact-avatar" style={{ background: color, width:22, height:22, fontSize:9 }}>
          {contact.firstName[0]}{contact.lastName[0]}
        </div>
        {contact.firstName} {contact.lastName}
        <button className="icon-btn" style={{ marginLeft:"auto", color:"var(--purple)" }} onClick={onClose}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--ink-secondary)", marginBottom:6 }}>Contact Info</div>
          {contact.email && <div style={{ fontSize:11, color:"var(--blue)" }}>✉️ {contact.email}</div>}
          {contact.phone && <div style={{ fontSize:11, color:"var(--ink-secondary)", marginTop:3 }}>📞 {contact.phone}</div>}
          {contact.deals.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--ink-secondary)", marginBottom:4 }}>Linked Deals</div>
              {contact.deals.map((d) => (
                <div key={d.dealId} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                  <span className={`badge stage-${d.stage}`} style={{ fontSize:9 }}>{STAGE_LABEL[d.stage]}</span>
                  <span style={{ fontSize:11, color:"var(--ink)" }}>{d.title}</span>
                  {fmt(d.amount) && <span style={{ fontSize:11, color:"var(--green)", fontWeight:600 }}>{fmt(d.amount)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--ink-secondary)", marginBottom:6 }}>Activity History</div>
          <ActivityTimeline activities={contact.activities} />
        </div>
      </div>
    </div>
  );
}

/* ── CompanyNode ────────────────────────────────────────── */
function CompanyNode({ company, onRefresh }: { company: Company; onRefresh: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const selContact = company.contacts.find((c) => c.contactId === selectedContact) ?? null;

  return (
    <div className="company-node fade-up">
      {/* Header */}
      <div className="company-node-header" onClick={() => setCollapsed((c) => !c)}>
        <div className="company-icon">{company.name[0].toUpperCase()}</div>
        <div style={{ flex:1 }}>
          <div className="company-name">{company.name}</div>
          <div className="company-meta">
            {company.industry && <span>{company.industry}</span>}
            {company.website && <span style={{ marginLeft:8, opacity:.7 }}>🌐 {company.website}</span>}
          </div>
        </div>
        <div className="company-stats">
          <div className="company-stat">
            <div className="company-stat-value">{company.contacts.length}</div>
            <div className="company-stat-label">Contacts</div>
          </div>
          <div className="company-stat">
            <div className="company-stat-value">{company.deals.length}</div>
            <div className="company-stat-label">Deals</div>
          </div>
          <div className="company-stat">
            <div className="company-stat-value">
              {company.deals.reduce((s, d) => s + d.activities.length, 0)}
            </div>
            <div className="company-stat-label">Activities</div>
          </div>
        </div>
        <svg style={{ width:18, height:18, color:"#8fa3bc", marginLeft:8, transition:"transform .2s", transform: collapsed?"none":"rotate(180deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
        </svg>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="company-node-body">
          {/* Contacts section */}
          {company.contacts.length > 0 && (
            <>
              <div className="section-label">
                <span style={{ color:"var(--purple)" }}>👤</span> Contacts
              </div>
              <div className="contact-chips">
                {company.contacts.map((c) => (
                  <ContactChip
                    key={c.contactId}
                    contact={c}
                    selected={selectedContact === c.contactId}
                    onClick={() => setSelectedContact(selectedContact === c.contactId ? null : c.contactId)}
                  />
                ))}
              </div>
              {/* Selected contact panel */}
              {selContact && (
                <ContactPanel
                  contact={selContact}
                  onClose={() => setSelectedContact(null)}
                />
              )}
            </>
          )}

          {/* Deals section */}
          <div className="section-label">
            <span style={{ color:"var(--blue)" }}>📊</span> Deals & Activities
          </div>
          {company.deals.length === 0 ? (
            <div className="node-empty">No deals yet for this account.</div>
          ) : (
            <div className="deal-cards">
              {company.deals.map((d) => (
                <DealCard
                  key={d.dealId}
                  deal={d}
                  highlighted={!!selContact && d.contact?.contactId === selectedContact}
                  onStageChange={onRefresh}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function ExplorerPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState("");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (q: string) => {
    setLoading(true);
    fetch(`/api/explorer?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => { setCompanies(d.companies); setLoading(false); });
  };

  useEffect(() => { load(""); }, []);

  const onSearch = (v: string) => {
    setQuery(v);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(v), 350);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">Relationship Explorer</h1>
          <p className="page-header-sub">
            See your accounts, contacts, deals & activities as a connected story
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--ink-secondary)" }}>
          <span className="badge badge-blue">{companies.length} accounts</span>
          <span className="badge badge-purple">
            {companies.reduce((s, c) => s + c.contacts.length, 0)} contacts
          </span>
          <span className="badge badge-neutral">
            {companies.reduce((s, c) => s + c.deals.length, 0)} deals
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="explorer-search">
        <div className="explorer-search-wrap">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <input
            type="text"
            placeholder="Search accounts or industry…"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {loading && (
          <span style={{ fontSize:12, color:"var(--ink-muted)" }}>Loading…</span>
        )}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { color:"var(--sidebar-accent)", label:"Account (root node)" },
          { color:"var(--purple)", label:"Contact (click to inspect)" },
          { color:"var(--blue)", label:"Deal (expand for timeline)" },
          { color:"var(--green)", label:"Won stage" },
        ].map((l) => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"var(--ink-secondary)" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:l.color, flexShrink:0 }}/>
            {l.label}
          </div>
        ))}
      </div>

      {/* Company nodes */}
      {loading ? (
        <div className="explorer-grid">
          {[0,1,2].map((i) => (
            <div key={i} className="company-node">
              <div className="company-node-header" style={{ background:"#1a2535" }}>
                <div className="skeleton" style={{ width:42, height:42, borderRadius:10, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div className="skeleton" style={{ width:160, height:16, borderRadius:4, marginBottom:6 }}/>
                  <div className="skeleton" style={{ width:100, height:11, borderRadius:4 }}/>
                </div>
              </div>
              <div className="company-node-body">
                <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                  {[0,1,2].map((j) => (
                    <div key={j} className="skeleton" style={{ width:140, height:44, borderRadius:24 }}/>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                  {[0,1,2].map((j) => (
                    <div key={j} className="skeleton" style={{ height:100, borderRadius:12 }}/>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="empty-state" style={{ padding:"80px 24px" }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15l.75 7.5H3.75L4.5 3z"/>
          </svg>
          <p style={{ fontSize:15, fontWeight:500 }}>No accounts found</p>
          <p style={{ fontSize:12, marginTop:4 }}>Add accounts on the Accounts page to see them here.</p>
        </div>
      ) : (
        <div className="explorer-grid">
          {companies.map((c) => (
            <CompanyNode key={c.companyId} company={c} onRefresh={() => load(query)} />
          ))}
        </div>
      )}
    </div>
  );
}

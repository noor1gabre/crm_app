"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StageGroup {
  stage: string;
  _count: { _all: number };
  _sum: { amount: string | null };
}

interface Activity {
  activityId: number;
  type: string;
  notes: string | null;
  createdAt: string;
  deal: { title: string } | null;
  contact: { firstName: string; lastName: string } | null;
}

interface DashboardStats {
  totalCompanies: number;
  totalContacts: number;
  totalDeals: number;
  dealsByStage: StageGroup[];
  recentActivities: Activity[];
  pipelineValue: number;
}

const STAGE_ORDER = ["prospecting", "qualified", "proposal", "won", "lost"];
const STAGE_LABEL: Record<string, string> = {
  prospecting: "Prospecting",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const ACTIVITY_COLORS: Record<string, string> = {
  call: "var(--blue)",
  email: "var(--purple)",
  meeting: "var(--green)",
  note: "var(--amber)",
};

function MetricSkeleton() {
  return (
    <div className="metric-card">
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: "60%", height: 28, marginBottom: 6, borderRadius: 4 }} />
      <div className="skeleton" style={{ width: "40%", height: 14, borderRadius: 4 }} />
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function DashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); });
  }, []);

  const stageMap = new Map<string, StageGroup>();
  stats?.dealsByStage.forEach((s) => stageMap.set(s.stage, s));

  const maxCount = Math.max(1, ...STAGE_ORDER.map((s) => stageMap.get(s)?._count._all ?? 0));

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Page header */}
      <div className="page-header fade-up">
        <div>
          <h1 className="page-header-title">{greeting}, Admin 👋</h1>
          <p className="page-header-sub">
            {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/companies" className="btn btn-secondary">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Account
          </Link>
          <Link href="/deals" className="btn btn-primary">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Deal
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {loading ? (
          [0,1,2,3].map((i) => <MetricSkeleton key={i} />)
        ) : (
          <>
            <div className="metric-card fade-up fade-up-1">
              <div className="metric-card-icon icon-bg-blue">
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l.75 7.5H3.75L4.5 3zM9 21V10.5m6 0V21" />
                </svg>
              </div>
              <div className="metric-card-value">{stats!.totalCompanies}</div>
              <div className="metric-card-label">Total Accounts</div>
              <div className="metric-card-delta neutral">
                <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                View all accounts
              </div>
            </div>
            <div className="metric-card fade-up fade-up-2">
              <div className="metric-card-icon icon-bg-purple">
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div className="metric-card-value">{stats!.totalContacts}</div>
              <div className="metric-card-label">Total Contacts</div>
              <div className="metric-card-delta neutral">
                <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                View all contacts
              </div>
            </div>
            <div className="metric-card fade-up fade-up-3">
              <div className="metric-card-icon icon-bg-amber">
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div className="metric-card-value">{stats!.totalDeals}</div>
              <div className="metric-card-label">Active Deals</div>
              <div className="metric-card-delta neutral">
                <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                View pipeline
              </div>
            </div>
            <div className="metric-card fade-up fade-up-4">
              <div className="metric-card-icon icon-bg-green">
                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="metric-card-value">{fmt(stats!.pipelineValue)}</div>
              <div className="metric-card-label">Pipeline Value</div>
              <div className="metric-card-delta up">
                <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
                Excl. lost deals
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pipeline funnel + Activity */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Pipeline funnel */}
        <div className="card fade-up fade-up-2">
          <div className="card-header">
            <div>
              <div className="card-title">Pipeline Stages</div>
              <div className="card-subtitle">Deal count by stage</div>
            </div>
            <Link href="/deals" className="btn btn-ghost" style={{ fontSize: 12 }}>View All →</Link>
          </div>
          <div className="card-body">
            {loading ? (
              STAGE_ORDER.map((s) => (
                <div key={s} style={{ marginBottom: 16 }}>
                  <div className="skeleton" style={{ width: "40%", height: 12, marginBottom: 6, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: "100%", height: 8, borderRadius: 4 }} />
                </div>
              ))
            ) : (
              STAGE_ORDER.map((stage) => {
                const g = stageMap.get(stage);
                const count = g?._count._all ?? 0;
                const amt   = Number(g?._sum.amount ?? 0);
                const pct   = Math.round((count / maxCount) * 100);
                return (
                  <div key={stage} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                      <span style={{ fontWeight: 500 }}>
                        <span className={`badge stage-${stage}`} style={{ marginRight: 8 }}>{STAGE_LABEL[stage]}</span>
                        {count} {count === 1 ? "deal" : "deals"}
                      </span>
                      {amt > 0 && <span style={{ color: "var(--ink-secondary)" }}>{fmt(amt)}</span>}
                    </div>
                    <div style={{ background: "var(--border)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                      <div
                        className="funnel-bar"
                        style={{
                          width: `${pct}%`,
                          background:
                            stage === "won" ? "var(--green)" :
                            stage === "lost" ? "var(--red)" :
                            stage === "proposal" ? "var(--amber)" :
                            stage === "qualified" ? "var(--purple)" :
                            "var(--blue)",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card fade-up fade-up-3">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Activity</div>
              <div className="card-subtitle">Latest logged interactions</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "12px 20px" }}>
            {loading ? (
              [0,1,2,3,4].map((i) => (
                <div key={i} className="activity-item">
                  <div className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: "70%", height: 12, borderRadius: 4, marginBottom: 5 }} />
                    <div className="skeleton" style={{ width: "40%", height: 10, borderRadius: 4 }} />
                  </div>
                </div>
              ))
            ) : stats!.recentActivities.length === 0 ? (
              <div className="empty-state">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>No activities logged yet.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Log an activity from the Pipeline page.</p>
              </div>
            ) : (
              stats!.recentActivities.map((a) => (
                <div key={a.activityId} className="activity-item">
                  <div className="activity-dot" style={{ background: ACTIVITY_COLORS[a.type] ?? "var(--ink-muted)" }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
                      <span style={{ textTransform: "capitalize", color: ACTIVITY_COLORS[a.type] }}>{a.type}</span>
                      {a.deal && <span style={{ color: "var(--ink-secondary)" }}> on <strong>{a.deal.title}</strong></span>}
                    </div>
                    {a.notes && <div style={{ fontSize: 11, color: "var(--ink-secondary)", marginTop: 2 }}>{a.notes}</div>}
                    <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 3 }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick-links footer */}
      <div className="card fade-up fade-up-4" style={{ padding: "14px 20px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--ink-secondary)", fontWeight: 500, marginRight: 8 }}>Quick Links:</span>
        {[
          { href: "/companies", label: "Accounts" },
          { href: "/contacts", label: "Contacts" },
          { href: "/deals", label: "Pipeline" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
            {l.label}
          </Link>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-muted)", fontFamily: "monospace" }}>
          OLTP source · rds-postgres · CDC Module 1
        </span>
      </div>
    </div>
  );
}

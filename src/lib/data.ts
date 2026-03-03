import type { Audit, Lead, LeadStatus, Locale, Report } from "../types";
import { getSingle, hasSupabaseConfig, insertRow, listRows, updateRow } from "./supabase";

const getLocal = <T,>(k: string): T[] => JSON.parse(localStorage.getItem(k) || "[]") as T[];
const setLocal = <T,>(k: string, v: T[]) => localStorage.setItem(k, JSON.stringify(v));

function upsertById<T extends { id: string }>(items: T[], next: T) {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) {
    items.push(next);
    return items;
  }
  items[index] = next;
  return items;
}

function cacheReportBundle(report: Report, audit: Audit) {
  const reports = getLocal<Report>("reports");
  const audits = getLocal<Audit>("audits");
  setLocal("reports", upsertById(reports, report));
  setLocal("audits", upsertById(audits, audit));
}

export async function getAdminLeads() {
  if (!hasSupabaseConfig) {
    const leads = getLocal<Lead>("leads");
    return leads.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  try {
    return await listRows<Lead>("leads", "select=*&order=created_at.desc");
  } catch {
    const leads = getLocal<Lead>("leads");
    return leads.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

export async function updateLead(id: string, payload: { status: LeadStatus; notes: string | null }) {
  if (!hasSupabaseConfig) {
    const leads = getLocal<Lead>("leads");
    const index = leads.findIndex((lead) => lead.id === id);
    if (index === -1) throw new Error("Lead not found");
    leads[index] = { ...leads[index], status: payload.status, notes: payload.notes };
    setLocal("leads", leads);
    return leads[index];
  }

  const updated = await updateRow<typeof payload, Lead>("leads", id, payload);
  if (!updated) throw new Error("Lead update failed");
  return updated as Lead;
}

export async function createLeadAuditReport(payload: {
  email: string;
  url: string;
  locale: Locale;
  metrics: Record<string, number>;
  scoreTotal: number;
  tech: Record<string, unknown>;
  summary: string;
  opportunities: string[];
  risks: string[];
}) {
  const createLocalBundle = () => {
    const lead: Lead = {
      id: crypto.randomUUID(), email: payload.email, url: payload.url, locale: payload.locale,
      status: "new", notes: "", source: null, created_at: new Date().toISOString()
    };
    const audit: Audit = {
      id: crypto.randomUUID(), lead_id: lead.id, url: payload.url, fetched_at: new Date().toISOString(),
      metrics: payload.metrics, tech: payload.tech, score_total: payload.scoreTotal
    };
    const report: Report = {
      id: crypto.randomUUID(), lead_id: lead.id, audit_id: audit.id, locale: payload.locale,
      summary: payload.summary, opportunities: payload.opportunities, risks: payload.risks,
      created_at: new Date().toISOString()
    };
    const leads = getLocal<Lead>("leads"); const audits = getLocal<Audit>("audits"); const reports = getLocal<Report>("reports");
    leads.push(lead); audits.push(audit); reports.push(report);
    setLocal("leads", leads); setLocal("audits", audits); setLocal("reports", reports);
    return {
      reportId: report.id,
      report,
      audit
    };
  };

  if (!hasSupabaseConfig) {
    return createLocalBundle();
  }

  try {
    const lead = await insertRow("leads", { email: payload.email, url: payload.url, locale: payload.locale, status: "new" });
    const audit = await insertRow("audits", {
      lead_id: lead.id,
      url: payload.url,
      metrics: payload.metrics,
      score_total: payload.scoreTotal,
      tech: payload.tech
    }) as Audit;
    const report = await insertRow("reports", {
      lead_id: lead.id, audit_id: audit.id, locale: payload.locale,
      summary: payload.summary, opportunities: payload.opportunities, risks: payload.risks
    }) as Report;

    cacheReportBundle(report, audit);

    return {
      reportId: report.id,
      report,
      audit
    };
  } catch {
    return createLocalBundle();
  }
}

export async function getReportBundle(reportId: string) {
  const getFromLocal = () => {
    const reports = getLocal<Report>("reports");
    const audits = getLocal<Audit>("audits");
    const report = reports.find((r) => r.id === reportId) || null;
    const audit = report ? audits.find((a) => a.id === report.audit_id) || null : null;
    return { report, audit };
  };

  if (!hasSupabaseConfig) {
    return getFromLocal();
  }

  try {
    const report = await getSingle<Report>("reports", reportId);
    const audit = report ? await getSingle<Audit>("audits", report.audit_id) : null;

    if (!report || !audit) {
      return getFromLocal();
    }

    cacheReportBundle(report, audit);
    return { report, audit };
  } catch {
    return getFromLocal();
  }
}

import type { Audit, Lead, Locale, Report } from "../types";
import { getSingle, hasSupabaseConfig, insertRow } from "./supabase";

const getLocal = <T,>(k: string): T[] => JSON.parse(localStorage.getItem(k) || "[]") as T[];
const setLocal = <T,>(k: string, v: T[]) => localStorage.setItem(k, JSON.stringify(v));

export async function createLeadAuditReport(payload: {
  email: string;
  url: string;
  locale: Locale;
  metrics: Record<string, number>;
  scoreTotal: number;
  summary: string;
  opportunities: string[];
  risks: string[];
}) {
  if (!hasSupabaseConfig) {
    const lead: Lead = {
      id: crypto.randomUUID(), email: payload.email, url: payload.url, locale: payload.locale,
      status: "new", notes: "", source: null, created_at: new Date().toISOString()
    };
    const audit: Audit = {
      id: crypto.randomUUID(), lead_id: lead.id, url: payload.url, fetched_at: new Date().toISOString(),
      metrics: payload.metrics, tech: {}, score_total: payload.scoreTotal
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
  }

  const lead = await insertRow("leads", { email: payload.email, url: payload.url, locale: payload.locale, status: "new" });
  const audit = await insertRow("audits", {
    lead_id: lead.id, url: payload.url, metrics: payload.metrics, score_total: payload.scoreTotal, tech: {}
  }) as Audit;
  const report = await insertRow("reports", {
    lead_id: lead.id, audit_id: audit.id, locale: payload.locale,
    summary: payload.summary, opportunities: payload.opportunities, risks: payload.risks
  }) as Report;

  return {
    reportId: report.id,
    report,
    audit
  };
}

export async function getReportBundle(reportId: string) {
  if (!hasSupabaseConfig) {
    const reports = getLocal<Report>("reports");
    const audits = getLocal<Audit>("audits");
    const report = reports.find((r) => r.id === reportId) || null;
    const audit = report ? audits.find((a) => a.id === report.audit_id) || null : null;
    return { report, audit };
  }

  const report = await getSingle<Report>("reports", reportId);
  const audit = report ? await getSingle<Audit>("audits", report.audit_id) : null;
  return { report, audit };
}

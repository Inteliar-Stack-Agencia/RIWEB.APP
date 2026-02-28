import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReportBundle } from "../lib/data";
import type { Audit, Locale, Report } from "../types";

export default function ReportPage({ locale }: { locale: Locale }) {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);

  useEffect(() => {
    if (!id) return;
    getReportBundle(id).then(({ report: r, audit: a }) => {
      setReport(r);
      setAudit(a);
    });
  }, [id]);

  if (!report || !audit) return <div className="card"><h2>Report not found</h2></div>;
  const m = audit.metrics;

  return (
    <>
      <div className="card">
        <span className="badge">{locale.toUpperCase()}</span>
        <h2>{locale === "es" ? "Reporte de auditoría" : "Audit report"}</h2>
        <p>{report.summary}</p>
        <p className="kpi">{audit.score_total}/100</p>
        <div className="grid">
          <div><p className="muted">Performance</p><strong>{m.performance}</strong></div>
          <div><p className="muted">SEO</p><strong>{m.seoBasics}</strong></div>
          <div><p className="muted">Mobile</p><strong>{m.mobile}</strong></div>
          <div><p className="muted">Conversion</p><strong>{m.conversion}</strong></div>
          <div><p className="muted">AI Readiness</p><strong>{m.aiReadiness}</strong></div>
        </div>
      </div>
      <div className="card">
        <h3>{locale === "es" ? "Oportunidades" : "Opportunities"}</h3>
        <ul className="list">{report.opportunities.map((o) => <li key={o}>{o}</li>)}</ul>
        <h3>{locale === "es" ? "Riesgos" : "Risks"}</h3>
        <ul className="list">{report.risks.map((r) => <li key={r}>{r}</li>)}</ul>
        <button>{locale === "es" ? "Modernizar mi web" : "Upgrade my website"}</button>
      </div>
    </>
  );
}

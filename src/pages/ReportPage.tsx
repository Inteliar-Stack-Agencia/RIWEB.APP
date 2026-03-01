import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getReportBundle } from "../lib/data";
import type { Audit, Locale, Report } from "../types";

export default function ReportPage({ locale }: { locale: Locale }) {
  const { id } = useParams();
  const location = useLocation();
  const routeState = location.state as { report?: Report; audit?: Audit } | null;
  const [report, setReport] = useState<Report | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(locale === "es" ? "Reporte inválido." : "Invalid report ID.");
      return;
    }

    if (routeState?.report && routeState?.audit) {
      setReport(routeState.report);
      setAudit(routeState.audit);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getReportBundle(id)
      .then(({ report: r, audit: a }) => {
        if (!r || !a) {
          setError(locale === "es" ? "No encontramos ese reporte." : "We couldn't find that report.");
          return;
        }
        setReport(r);
        setAudit(a);
      })
      .catch((err) => {
        console.error("Failed to load report", err);
        setError(locale === "es"
          ? "No pudimos cargar tu reporte. Intentá nuevamente."
          : "We couldn't load your report. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, locale, routeState]);

  if (loading) return <div className="card"><h2>{locale === "es" ? "Cargando reporte..." : "Loading report..."}</h2></div>;
  if (error) return <div className="card"><h2>{error}</h2></div>;
  if (!report || !audit) return <div className="card"><h2>{locale === "es" ? "Reporte no encontrado" : "Report not found"}</h2></div>;
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

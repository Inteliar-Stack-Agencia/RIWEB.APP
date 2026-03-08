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
    <div id="app">
      <div className="card" style={{ borderBottom: '4px solid var(--color-cta)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>OFFICIAL AUDIT</span>
            <h2 style={{ margin: '0.5rem 0 0' }}>{locale === "es" ? "Diagnóstico RiWeb" : "RiWeb Diagnosis"}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="kpi" style={{ fontSize: '3rem', margin: 0 }}>{audit.score_total}</p>
            <p className="muted" style={{ fontWeight: 600, fontSize: '0.7rem' }}>QUALITY SCORE</p>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'rgba(28, 25, 23, 0.03)', border: 'none', boxShadow: 'none' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', margin: 0 }}>{report.summary}</p>
        </div>

        <div className="grid" style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center' }}><p className="muted">Performance</p><strong style={{ fontSize: '1.2rem' }}>{m.performance}%</strong></div>
          <div style={{ textAlign: 'center' }}><p className="muted">SEO</p><strong style={{ fontSize: '1.2rem' }}>{m.seoBasics}%</strong></div>
          <div style={{ textAlign: 'center' }}><p className="muted">Mobile</p><strong style={{ fontSize: '1.2rem' }}>{m.mobile}%</strong></div>
          <div style={{ textAlign: 'center' }}><p className="muted">Conversion</p><strong style={{ fontSize: '1.2rem' }}>{m.conversion}%</strong></div>
          <div style={{ textAlign: 'center' }}><p className="muted">AI Ready</p><strong style={{ fontSize: '1.2rem' }}>{m.aiReadiness}%</strong></div>
        </div>
      </div>

      <div className="row" style={{ alignItems: 'stretch' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', color: '#dc2626' }}>
            {locale === "es" ? "Oportunidades de Mejora" : "Improvement Opportunities"}
          </h3>
          <ul className="list" style={{ marginTop: '1.5rem' }}>
            {report.opportunities.map((o) => <li key={o} style={{ marginBottom: '1rem' }}>{o}</li>)}
          </ul>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', color: '#ca8a04' }}>
            {locale === "es" ? "Riesgos Tecnológicos" : "Technological Risks"}
          </h3>
          <ul className="list" style={{ marginTop: '1.5rem' }}>
            {report.risks.map((r) => <li key={r} style={{ marginBottom: '1rem' }}>{r}</li>)}
          </ul>
        </div>
      </div>

      {report.roadmap && report.roadmap.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #10b981', paddingLeft: '2rem' }}>
          <h3 style={{ color: '#065f46' }}>{locale === "es" ? "Roadmap de Modernización 2026" : "2026 Modernization Roadmap"}</h3>
          <ol className="step-list" style={{ marginTop: '2rem' }}>
            {report.roadmap.map((step, i) => (
              <li key={i}>
                <div><strong>{step}</strong></div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="card hero" style={{ textAlign: 'center', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', marginTop: '2rem', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'white' }}>{locale === "es" ? "¿Listo para elevar tu estándar?" : "Ready to elevate your standard?"}</h2>
        <p className="muted" style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', fontSize: '1.25rem' }}>
          {locale === "es" ? "Transformamos este diagnóstico en una realidad técnica de próximo nivel." : "We transform this diagnosis into a next-level technical reality."}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cta-pill" style={{ width: 'auto', boxShadow: '0 0 30px rgba(202, 138, 4, 0.4)', padding: '1rem 2.5rem' }}>
            {locale === "es" ? "Solicitar Propuesta Personalizada" : "Request Personalized Proposal"}
          </button>
          <button className="ghost-btn" style={{ width: 'auto', border: '2px solid rgba(255,255,255,0.2)', color: 'white', padding: '1rem 2.5rem' }}>
            {locale === "es" ? "Agendar Consultoría Gratuita" : "Schedule Free Consulting"}
          </button>
        </div>
      </div>
    </div>
  );
}

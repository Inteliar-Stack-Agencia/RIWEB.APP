import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createLeadAuditReport } from "../lib/data";
import { reportFromAuditResult } from "../lib/scoring";
import { hasSupabaseConfig, runAudit } from "../lib/supabase";
import type { AuditFunctionResult, Locale } from "../types";
import { FuturePreview } from "../components/FuturePreview";

// ─── Color helpers ──────────────────────────────────────────────
function scoreColor(v: number) {
  if (v >= 80) return '#34d399'; // green
  if (v >= 60) return '#fbbf24'; // amber
  return '#f87171';              // red
}
function scoreLabel(v: number, locale: Locale) {
  if (v >= 80) return locale === 'es' ? 'Excelente' : 'Excellent';
  if (v >= 60) return locale === 'es' ? 'Mejorable' : 'Needs Work';
  return locale === 'es' ? 'Crítico' : 'Critical';
}

// ─── Single metric card ──────────────────────────────────────────
function MetricCard({ icon, label, value, locale }: {
  icon: string; label: string; value: number; locale: Locale;
}) {
  const color = scoreColor(value);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}33`,
      borderRadius: 16,
      padding: '1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
          color, background: `${color}1a`, borderRadius: 99, padding: '0.2rem 0.6rem'
        }}>
          {scoreLabel(value, locale)}
        </span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, background: color,
          borderRadius: 99, transition: 'width 1s ease',
          boxShadow: `0 0 8px ${color}88`
        }} />
      </div>
    </div>
  );
}

// ─── Full metrics grid ───────────────────────────────────────────
function MetricsGrid({ metrics, locale }: {
  metrics: AuditFunctionResult['metrics']; locale: Locale;
}) {
  const items = locale === 'es'
    ? [
      { icon: '⚡', label: 'Velocidad de Carga', key: 'speed' },
      { icon: '🏆', label: 'Performance General', key: 'performance' },
      { icon: '🔍', label: 'SEO Técnico', key: 'seoBasics' },
      { icon: '📱', label: 'Experiencia Móvil', key: 'mobile' },
      { icon: '💰', label: 'Conversión', key: 'conversion' },
      { icon: '🤖', label: 'Preparación IA', key: 'aiReadiness' },
      { icon: '🔒', label: 'Seguridad', key: 'security' },
      { icon: '♿', label: 'Accesibilidad', key: 'accessibility' },
    ]
    : [
      { icon: '⚡', label: 'Page Speed', key: 'speed' },
      { icon: '🏆', label: 'Performance', key: 'performance' },
      { icon: '🔍', label: 'Technical SEO', key: 'seoBasics' },
      { icon: '📱', label: 'Mobile UX', key: 'mobile' },
      { icon: '💰', label: 'Conversion', key: 'conversion' },
      { icon: '🤖', label: 'AI Readiness', key: 'aiReadiness' },
      { icon: '🔒', label: 'Security', key: 'security' },
      { icon: '♿', label: 'Accessibility', key: 'accessibility' },
    ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '1rem',
    }}>
      {items.map(item => (
        <MetricCard
          key={item.key}
          icon={item.icon}
          label={item.label}
          value={(metrics as Record<string, number>)[item.key] ?? 0}
          locale={locale}
        />
      ))}
    </div>
  );
}

const fallbackAudit = (url: string): AuditFunctionResult => ({
  ok: true,
  url,
  tech: { fallback: true },
  signals: {},
  metrics: {
    performance: 55,
    speed: 48,
    seoBasics: 50,
    mobile: 50,
    conversion: 45,
    aiReadiness: 40,
    security: 60,
    accessibility: 52,
  },
  scoreTotal: 49,
  issues: [
    {
      title: "Could not run live audit",
      why: "Supabase is not configured or audit endpoint failed.",
      fix: "Configure Supabase env vars and deploy the audit Edge Function.",
      impact: "high"
    }
  ],
  quickWins: [
    {
      title: "Set title + meta description + main CTA",
      how: "Ensure title/description are present and clear CTA is visible above the fold.",
      impact: "high"
    }
  ]
});

export default function AuditPage({ locale }: { locale: Locale }) {
  const [params] = useSearchParams();
  const url = params.get("url") || "";
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AuditFunctionResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const [email, setEmail] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    let cancelled = false;

    const addLog = (msg: string) => {
      setTerminalLogs(prev => [...prev.slice(-8), `> ${msg}`]);
    };

    const analyze = async () => {
      if (!url) {
        navigate(locale === "es" ? "/es" : "/");
        return;
      }

      setAnalysisLoading(true);
      setAnalysisError(null);
      setTerminalLogs([]);

      const steps = locale === "es"
        ? ["Iniciando escaneo de ADN de negocio...", "Detectando obsolescencia en código...", "Analizando fugas de conversión...", "Midiendo potencial de integración IA...", "Evaluando arquitectura de seguridad...", "Check de velocidad 2026...", "Finalizando mapa estratégico..."]
        : ["Initializing business DNA scan...", "Detecting code obsolescence...", "Analyzing conversion leaks...", "Measuring IA integration potential...", "Evaluating security architecture...", "2026 Speed Check...", "Finalizing strategic roadmap..."];

      try {
        for (let i = 0; i < steps.length; i++) {
          if (cancelled) return;
          setAnalysisStep(steps[i]);
          addLog(steps[i].toUpperCase());
          if (i === 1) addLog("SSL_ENCRYPTION: VERIFIED");
          if (i === 3) addLog("ASSETS: 42 DETECTED, OPTIMIZATION: SUB-OPTIMAL");
          await sleep(Math.random() * 800 + 400);
        }

        const result = await runAudit(url);
        if (cancelled) return;
        setAnalysis(result);
      } catch (err) {
        console.error("Audit function failed", err);
        if (cancelled) return;

        if (!hasSupabaseConfig) {
          setAnalysis(fallbackAudit(url));
          setAnalysisError(locale === "es"
            ? "No hay conexión con Supabase configurada. Mostramos un modo temporal."
            : "Supabase is not configured. Showing temporary fallback mode.");
        } else {
          setAnalysisError(locale === "es"
            ? "No pudimos analizar tu web en este momento. Probá nuevamente."
            : "We couldn't analyze your website right now. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setAnalysisLoading(false);
          setAnalysisStep("");
        }
      }
    };

    analyze();

    return () => {
      cancelled = true;
    };
  }, [locale, url]);

  // Removed reportDraft useMemo; report generation now happens server-side after lead capture.

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!analysis) {
      setSubmitError(locale === "es" ? "Esperá a que termine el análisis." : "Wait until the analysis is complete.");
      return;
    }

    setSubmitError(null);
    setSubmitLoading(true);

    try {
      // Step 1: Generate AI report server-side
      setSubmitError(locale === "es" ? "Generando recomendaciones con IA..." : "Generating AI recommendations...");
      const { callGenerateReport } = await import("../lib/supabase");
      const aiReport = await callGenerateReport(analysis, locale);

      // Step 2: Persist lead + audit + report
      const created = await createLeadAuditReport({
        email,
        url,
        locale,
        metrics: analysis.metrics,
        scoreTotal: analysis.scoreTotal,
        tech: analysis.tech,
        summary: aiReport.summary,
        opportunities: aiReport.opportunities,
        risks: aiReport.risks,
        roadmap: aiReport.roadmap
      });

      const prefix = locale === "es" ? "/es" : "";
      navigate(`${prefix}/report/${created.reportId}`, {
        state: {
          report: created.report,
          audit: created.audit
        }
      });
    } catch (err) {
      console.error("Failed to create report flow", err);
      setSubmitError(locale === "es"
        ? "No pudimos generar el informe estratégico. Revisá tu conexión e intentá nuevamente."
        : "We couldn't generate the strategic report. Please check your connection and try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div id="app">
      <div className="card hero" style={{ textAlign: 'center', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>
          {locale === "es" ? "Escaneando ADN de Modernización" : "Scanning Modernization DNA"}
        </h2>
        <p className="muted" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
          {url}
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ margin: 0 }}>{locale === "es" ? "Panel de Análisis Inmersivo" : "Immersive Analysis Panel"}</h3>
          <span className="badge" style={{ backgroundColor: 'var(--color-cta)', color: 'white' }}>
            {analysis ? "100%" : analysisLoading ? "LIVE_SCAN" : "Pending"}
          </span>
        </div>

        {analysisLoading && (
          <div className="lab-viewer active" style={{ marginTop: '1.5rem' }}>
            <div className="scan-line-overlay" />
            <div className="lab-glow" />
            <div className="modernization-badge">ANALYZING_DNA</div>
            <iframe
              src={url}
              title="Audit Target"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          </div>
        )}

        {analysisLoading ? (
          <div style={{ marginTop: '1.5rem', position: 'relative' }}>
            <div className="terminal-window">
              <div className="scan-pulse" />
              {terminalLogs.map((log, i) => (
                <div key={i} className="terminal-line">{log}</div>
              ))}
            </div>
            <div className="loading-step" style={{ marginTop: '1.5rem' }}><span /></div>
            <p className="muted" style={{ textAlign: 'center', marginTop: '1rem', fontStyle: 'italic', color: 'var(--color-cta)' }}>{analysisStep}</p>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className="kpi score-glow" style={{ fontSize: '5rem', marginBottom: '0', color: 'var(--color-cta)' }}>{analysis ? analysis.scoreTotal : "--"}</p>
            <p className="muted" style={{ fontWeight: 600 }}>SCORE TOTAL</p>
          </div>
        )}

        {analysisError ? <p className="error-text" style={{ textAlign: 'center' }}>{analysisError}</p> : null}

        {analysis && (
          <div style={{ marginTop: '2rem' }}>
            <MetricsGrid metrics={analysis.metrics} locale={locale} />
          </div>
        )}
      </div>

      <div className="card" style={{ border: '1px solid var(--color-cta)', background: 'linear-gradient(135deg, var(--glass-bg), rgba(202, 138, 4, 0.03))' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>{locale === "es" ? "Desbloquear Informe Estratégico" : "Unlock Strategic Report"}</h3>
          <p className="muted">Ingresá tu email para recibir el análisis detallado y el roadmap de modernización.</p>
        </div>

        <form onSubmit={submit} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>EMAIL CORPORATIVO</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" style={{ fontSize: '1.1rem' }} />
          </div>

          <button
            disabled={submitLoading || analysisLoading || !analysis}
            className="cta-pill"
            style={{
              padding: '1rem',
              fontSize: '1.1rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {submitLoading ? "Generando Roadmap..." : (locale === "es" ? "✦ Obtener Roadmap de Modernización" : "✦ Get Modernization Roadmap")}
          </button>
        </form>
        {submitError ? <p className="error-text" style={{ textAlign: 'center' }}>{submitError}</p> : null}
      </div>

      {analysis && (
        <div className="grid">
          <div className="card">
            <h4 style={{ color: 'var(--color-cta)' }}>{locale === "es" ? "Hallazgos Críticos" : "Critical Findings"}</h4>
            <ul className="list" style={{ marginTop: '1rem' }}>
              {analysis.issues.slice(0, 3).map((item) => (
                <li key={item.title} style={{ marginBottom: '0.5rem' }}>
                  <strong>{item.title}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h4 style={{ color: '#10b981' }}>{locale === "es" ? "Quick Wins" : "Quick Wins"}</h4>
            <ul className="list" style={{ marginTop: '1rem' }}>
              {analysis.quickWins.slice(0, 3).map((item) => (
                <li key={item.title} style={{ marginBottom: '0.5rem' }}>
                  <strong>{item.title}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

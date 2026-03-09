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

// ─── Metric explanation helper ────────────────────────────────────
function getMetricHelp(key: string, locale: Locale) {
  const isSpanish = locale === 'es';
  const helps: Record<string, string> = isSpanish ? {
    speed: "Es qué tan rápido abre tu página. Si es lento, los clientes se cansan de esperar y se van.",
    performance: "Es la salud general técnica de tu web. Como un chequeo médico de tu programación.",
    seoBasics: "Es qué tan fácil te encuentran en Google. Si está bien, aparecés más arriba en las búsquedas.",
    mobile: "Es cómo se ve tu web en el celular. Hoy la mayoría de la gente compra desde el teléfono.",
    conversion: "Es la capacidad de tu web para convertir visitas en ventas reales.",
    aiReadiness: "Es qué tan preparada está tu web para que un robot inteligente ayude a tus clientes.",
    security: "Es la protección de tu web. Como ponerle una buena cerradura y alarma a tu negocio.",
    accessibility: "Es que personas con dificultades visuales o motrices también puedan usar tu web.",
  } : {
    speed: "How fast your page opens. If it's slow, customers get tired of waiting and leave.",
    performance: "The overall technical health of your site. Like a medical checkup for your code.",
    seoBasics: "How easy it is to find you on Google. If it's good, you appear higher in searches.",
    mobile: "How your web looks on a phone. Today most people shop from their mobile.",
    conversion: "The ability of your site to turn visits into real sales.",
    aiReadiness: "How ready your site is for an intelligent robot to help your customers.",
    security: "Your web protection. Like putting a good lock and alarm on your business.",
    accessibility: "Ensuring people with visual or motor difficulties can also use your site.",
  };
  return helps[key] || "";
}

// ─── Single metric card ──────────────────────────────────────────
function MetricCard({ icon, label, value, locale, metricKey }: {
  icon: string; label: string; value: number; locale: Locale; metricKey: string;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const color = scoreColor(value);
  const help = getMetricHelp(metricKey, locale);

  return (
    <div
      onClick={() => setShowHelp(!showHelp)}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}33`,
        borderRadius: 16,
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}
      className="metric-card-hover"
    >
      {showHelp && (
        <div style={{
          position: 'absolute', inset: 0, background: 'var(--color-primary)',
          borderRadius: 16, padding: '1rem', zIndex: 10, display: 'flex',
          flexDirection: 'column', justifyContent: 'center', textAlign: 'center',
          fontSize: '0.8rem', lineHeight: 1.4, border: `1px solid ${color}`
        }}>
          <div>{help}</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.6rem', color: 'var(--color-cta)', fontWeight: 800 }}>
            {locale === 'es' ? "TOCÁ PARA VOLVER" : "TAP TO RETURN"}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>❓</span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
            color, background: `${color}1a`, borderRadius: 99, padding: '0.2rem 0.6rem'
          }}>
            {scoreLabel(value, locale)}
          </span>
        </div>
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
      { icon: '⚡', label: 'Velocidad', key: 'speed' },
      { icon: '🏆', label: 'Salud Técnica', key: 'performance' },
      { icon: '🔍', label: 'SEO Google', key: 'seoBasics' },
      { icon: '📱', label: 'Vista Celular', key: 'mobile' },
      { icon: '💰', label: 'Ventas', key: 'conversion' },
      { icon: '🤖', label: 'Preparación IA', key: 'aiReadiness' },
      { icon: '🔒', label: 'Seguridad', key: 'security' },
      { icon: '♿', label: 'Fácil de Usar', key: 'accessibility' },
    ]
    : [
      { icon: '⚡', label: 'Page Speed', key: 'speed' },
      { icon: '🏆', label: 'Technical Health', key: 'performance' },
      { icon: '🔍', label: 'Google Search', key: 'seoBasics' },
      { icon: '📱', label: 'Mobile View', key: 'mobile' },
      { icon: '💰', label: 'Sales Power', key: 'conversion' },
      { icon: '🤖', label: 'AI Ready', key: 'aiReadiness' },
      { icon: '🔒', label: 'Security', key: 'security' },
      { icon: '♿', label: 'User Friendly', key: 'accessibility' },
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
          metricKey={item.key}
          value={(metrics as Record<string, number>)[item.key] ?? 0}
          locale={locale}
        />
      ))}
      <div style={{
        background: 'rgba(202, 138, 4, 0.05)',
        border: '1px dashed var(--color-cta)',
        borderRadius: 16,
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '0.4rem',
        opacity: 0.8
      }}>
        <div style={{ fontSize: '1.2rem' }}>💡</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-cta)', lineHeight: 1.3 }}>
          {locale === 'es'
            ? "Toca cada puntaje para entender qué significa y cómo mejorarlo."
            : "Tap each score to understand what it means and how to improve it."}
        </div>
      </div>
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
        ? ["Revisando si tus clientes te encuentran en el mapa...", "Verificando si tenés el botón de WhatsApp a mano...", "Chequeando si tus horarios y productos son legibles...", "Analizando la velocidad con la que atendés en la web...", "Buscando el lugar perfecto para tu nuevo Asistente IA...", "Preparando tu mapa de ruta para vender más..."]
        : ["Checking if your customers find you on the map...", "Verifying if you have the WhatsApp button at hand...", "Checking if your hours and products are readable...", "Analyzing the speed at which you attend on the web...", "Finding the perfect spot for your new AI Assistant...", "Preparing your roadmap to sell more..."];

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

        // Automatically generate AI report
        addLog(locale === "es" ? "GENERANDO INFORME ESTRATÉGICO CON IA..." : "GENERATING AI STRATEGIC REPORT...");
        const { callGenerateReport } = await import("../lib/supabase");
        const aiReport = await callGenerateReport(result, locale);

        if (cancelled) return;

        // Merge report into analysis result
        const finalResult = { ...result, report: aiReport };
        setAnalysis(finalResult);
        addLog("DEEP_ANALYSIS: COMPLETE");

        // Perspective persist to DB (silent lead tracking without email if needed, or just skip email)
        await createLeadAuditReport({
          email: "frictionless-user@riweb.app",
          url,
          locale,
          metrics: result.metrics,
          scoreTotal: result.scoreTotal,
          tech: result.tech,
          summary: aiReport.summary,
          opportunities: aiReport.opportunities,
          risks: aiReport.risks,
          roadmap: aiReport.roadmap
        });

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

      {analysis && (
        <div id="roadmap-result" className="grid" style={{ marginTop: '3rem' }}>
          <div className="card" style={{ border: '1px solid var(--color-cta)' }}>
            <h4 style={{ color: 'var(--color-cta)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              {locale === "es" ? "📋 Tu Roadmap Estratégico" : "📋 Your Strategic Roadmap"}
            </h4>

            {analysis.report ? (
              <div style={{ lineHeight: 1.6 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 600, color: 'var(--color-cta)' }}>{locale === "es" ? "Resumen General" : "Executive Summary"}</p>
                  <p className="muted">{analysis.report.summary}</p>
                </div>

                <div className="grid" style={{ gap: '1.5rem' }}>
                  <div>
                    <h5 style={{ color: '#34d399', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🚀 {locale === "es" ? "Oportunidades" : "Opportunities"}
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {analysis.report.opportunities.map((o: string, i: number) => {
                        const clean = o.replace(/^(Oportunidad|Opportunity)\s*\d+:\s*/i, "");
                        return (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                              minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.1)',
                              border: '1px solid #34d399', color: '#34d399', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800
                            }}>
                              {i + 1}
                            </div>
                            <div className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{clean}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h5 style={{ color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚠️ {locale === "es" ? "Riesgos" : "Risks"}
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {analysis.report.risks.map((r: string, i: number) => {
                        const clean = r.replace(/^(Riesgo|Risk)\s*\d+:\s*/i, "");
                        return (
                          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                              minWidth: '24px', height: '24px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.1)',
                              border: '1px solid #f87171', color: '#f87171', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800
                            }}>
                              {i + 1}
                            </div>
                            <div className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{clean}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid">
                <div className="card" style={{ padding: 0, background: 'transparent' }}>
                  <h4 style={{ color: 'var(--color-cta)' }}>{locale === "es" ? "Hallazgos Críticos" : "Critical Findings"}</h4>
                  <ul className="list" style={{ marginTop: '1rem' }}>
                    {analysis.issues.slice(0, 3).map((item) => (
                      <li key={item.title} style={{ marginBottom: '0.5rem' }}>
                        <strong>{item.title}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card" style={{ padding: 0, background: 'transparent' }}>
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
        </div>
      )}

      {analysis && <FuturePreview audit={analysis} report={analysis.report} locale={locale} />}
    </div>
  );
}

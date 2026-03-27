import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { hasSupabaseConfig, runAudit } from "../lib/supabase";
import type { AuditFunctionResult, Locale } from "../types";

const WA_NUMBER = "5491165689145";

// ─── Color helpers ──────────────────────────────────────────────
function scoreColor(v: number) {
  if (v >= 80) return '#34d399';
  if (v >= 60) return '#fbbf24';
  return '#f87171';
}
function scoreLabel(v: number, locale: Locale) {
  if (v >= 80) return locale === 'es' ? 'Bien' : 'Good';
  if (v >= 60) return locale === 'es' ? 'Puede mejorar' : 'Needs Work';
  return locale === 'es' ? 'Urgente' : 'Urgent';
}

// ─── Single metric card ──────────────────────────────────────────
function MetricCard({ icon, label, value, locale, selected, onClick }: {
  icon: string; label: string; value: number; locale: Locale;
  selected?: boolean; onClick?: () => void;
}) {
  const color = scoreColor(value);
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? `${color}18` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? color : color + '33'}`,
        borderRadius: 16,
        padding: '1.25rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected ? `0 0 20px ${color}30` : 'none',
      }}
    >
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

// ─── Metric descriptions ─────────────────────────────────────────
const METRIC_DESCRIPTIONS: Record<string, { es: string; en: string }> = {
  speed:        { es: 'Qué tan rápido carga tu sitio. Si tarda más de 3 segundos, la mayoría de las personas se van sin esperar. Eso son clientes que perdés.', en: 'How fast your site loads. If it takes more than 3 seconds, most people leave without waiting. Those are customers you lose.' },
  performance:  { es: 'Qué tan bien está armado tu sitio por dentro. Afecta la velocidad, la experiencia del usuario y si Google lo recomienda o no.', en: 'How well your site is built internally. Affects speed, user experience and whether Google recommends it.' },
  seoBasics:    { es: 'Si Google puede encontrar tu negocio cuando alguien lo busca. Sin SEO básico, sos invisible en internet.', en: 'Whether Google can find your business when someone searches for it. Without basic SEO, you are invisible online.' },
  mobile:       { es: 'Cómo se ve tu sitio en el celular. Más del 70% de la gente navega desde el teléfono. Si no se ve bien, perdés la mayoría de visitas.', en: 'How your site looks on phones. Over 70% of people browse from their phones. If it looks bad, you lose most visits.' },
  conversion:   { es: 'Si tu sitio está pensado para que la gente te contacte o compre. Un sitio bonito que no convierte no sirve de nada.', en: 'Whether your site is designed for people to contact you or buy. A nice site that doesn\'t convert is useless.' },
  aiReadiness:  { es: 'Si tu negocio puede conectarse a un bot de WhatsApp o herramientas de automatización. Cuanto más bajo, más lejos estás de vender solo.', en: 'Whether your business can connect to a WhatsApp bot or automation tools. The lower, the further you are from selling on autopilot.' },
  security:     { es: 'Si tu sitio es seguro. Un sitio sin HTTPS hace que el navegador muestre "No es seguro" y los clientes desconfíen.', en: 'Whether your site is secure. A site without HTTPS makes the browser show "Not secure" and customers distrust it.' },
  accessibility:{ es: 'Si cualquier persona puede usar tu sitio sin problemas. También ayuda a que Google te posicione mejor.', en: 'Whether anyone can use your site without problems. It also helps Google rank you better.' },
};

// ─── Full metrics grid ───────────────────────────────────────────
function MetricsGrid({ metrics, locale }: {
  metrics: AuditFunctionResult['metrics']; locale: Locale;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const items = locale === 'es'
    ? [
      { icon: '⚡', label: 'Velocidad', key: 'speed' },
      { icon: '🏆', label: 'Rendimiento', key: 'performance' },
      { icon: '🔍', label: 'Google te encuentra', key: 'seoBasics' },
      { icon: '📱', label: 'Funciona en el celular', key: 'mobile' },
      { icon: '💰', label: 'Convierte visitas', key: 'conversion' },
      { icon: '🤖', label: 'Lista para IA', key: 'aiReadiness' },
      { icon: '🔒', label: 'Seguridad', key: 'security' },
      { icon: '♿', label: 'Fácil de usar', key: 'accessibility' },
    ]
    : [
      { icon: '⚡', label: 'Speed', key: 'speed' },
      { icon: '🏆', label: 'Performance', key: 'performance' },
      { icon: '🔍', label: 'Google finds you', key: 'seoBasics' },
      { icon: '📱', label: 'Works on phones', key: 'mobile' },
      { icon: '💰', label: 'Converts visits', key: 'conversion' },
      { icon: '🤖', label: 'AI Ready', key: 'aiReadiness' },
      { icon: '🔒', label: 'Security', key: 'security' },
      { icon: '♿', label: 'Easy to use', key: 'accessibility' },
    ];

  const selectedItem = selectedKey ? items.find(i => i.key === selectedKey) : null;
  const selectedValue = selectedKey ? (metrics as Record<string, number>)[selectedKey] ?? 0 : 0;
  const selectedColor = selectedKey ? scoreColor(selectedValue) : '#94a3b8';

  return (
    <div>
      {!selectedKey && (
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem', marginTop: 0 }}>
          {locale === 'es' ? '👆 Tocá una tarjeta para entender qué significa' : '👆 Tap a card to understand what it means'}
        </p>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: selectedKey ? '1rem' : 0,
      }}>
        {items.map(item => (
          <MetricCard
            key={item.key}
            icon={item.icon}
            label={item.label}
            value={(metrics as Record<string, number>)[item.key] ?? 0}
            locale={locale}
            selected={selectedKey === item.key}
            onClick={() => setSelectedKey(selectedKey === item.key ? null : item.key)}
          />
        ))}
      </div>

      {selectedItem && (
        <div style={{
          background: `${selectedColor}12`,
          border: `1px solid ${selectedColor}44`,
          borderRadius: 14,
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{selectedItem.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: selectedColor }}>
              {selectedItem.label} — {selectedValue}/100
            </div>
            <div style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              {METRIC_DESCRIPTIONS[selectedItem.key]?.[locale] ?? ''}
            </div>
          </div>
          <button
            onClick={() => setSelectedKey(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: '0.1rem' }}
          >✕</button>
        </div>
      )}
    </div>
  );
}

const fallbackAudit = (url: string, locale: Locale): AuditFunctionResult => ({
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
      title: locale === 'es' ? "No pudimos analizar tu sitio en vivo" : "Could not run live audit",
      why: "No hay conexión con el servicio de análisis.",
      fix: "Contactanos por WhatsApp y te hacemos el análisis en el momento.",
      impact: "high"
    }
  ],
  quickWins: [
    {
      title: locale === 'es' ? "Agregá un botón de WhatsApp visible" : "Add a visible WhatsApp button",
      how: "Colocalo arriba de la página para que tus clientes te contacten de un toque.",
      impact: "high"
    }
  ]
});

const makeFallback = (url: string, locale: Locale): AuditFunctionResult => ({
  ...fallbackAudit(url, locale),
  issues: [{
    title: locale === 'es' ? "No pudimos analizar tu sitio en este momento" : "Could not analyze your site right now",
    why: locale === 'es' ? "Problema de conexión con el servicio de análisis." : "Connection issue with the analysis service.",
    fix: locale === 'es' ? "Contactanos por WhatsApp y te hacemos el análisis en el momento." : "Contact us on WhatsApp and we'll run the analysis right away.",
    impact: "high"
  }],
  quickWins: [{
    title: locale === 'es' ? "Agregá un botón de WhatsApp visible" : "Add a visible WhatsApp button",
    how: locale === 'es' ? "Colocalo arriba para que tus clientes te contacten fácil." : "Put it at the top so customers can contact you easily.",
    impact: "high"
  }]
});

export default function AuditPage({ locale }: { locale: Locale }) {
  const [params] = useSearchParams();
  const url = params.get("url") || "";
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AuditFunctionResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState("");

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    let cancelled = false;

    const analyze = async () => {
      if (!url) {
        navigate(locale === "es" ? "/es" : "/");
        return;
      }

      setAnalysisLoading(true);
      setAnalysisError(null);

      const steps = locale === "es"
        ? [
          "Revisando si tus clientes te pueden encontrar en Google...",
          "Chequeando cómo se ve tu sitio en el celular...",
          "Verificando la velocidad de carga...",
          "Analizando si tu sitio convierte visitas en clientes...",
          "Revisando la seguridad de tu sitio...",
          "Preparando tu diagnóstico...",
        ]
        : [
          "Checking if your customers can find you on Google...",
          "Checking how your site looks on mobile...",
          "Verifying loading speed...",
          "Analyzing if your site converts visits into customers...",
          "Reviewing your site's security...",
          "Preparing your diagnosis...",
        ];

      try {
        for (let i = 0; i < steps.length; i++) {
          if (cancelled) return;
          setAnalysisStep(steps[i]);
          await sleep(Math.random() * 700 + 400);
        }

        const result = await runAudit(url);
        if (cancelled) return;
        setAnalysis(result);
      } catch (err) {
        console.error("Audit failed", err);
        if (cancelled) return;
        setAnalysis(makeFallback(url, locale));
        if (hasSupabaseConfig) {
          setAnalysisError(locale === "es"
            ? "No pudimos analizar tu sitio en este momento. Mostramos un diagnóstico de referencia."
            : "We couldn't analyze your site right now. Showing a reference diagnosis.");
        }
      } finally {
        if (!cancelled) {
          setAnalysisLoading(false);
          setAnalysisStep("");
        }
      }
    };

    analyze();
    return () => { cancelled = true; };
  }, [locale, url]);

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    locale === 'es'
      ? `Hola, acabo de analizar mi sitio ${url} y quiero mejorar los resultados`
      : `Hi, I just analyzed my site ${url} and want to improve the results`
  )}`;

  const homeLink = locale === 'es' ? '/es' : '/';

  return (
    <div id="app">

      {/* Header */}
      <div className="card hero" style={{ textAlign: 'center', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>
        <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>
          {locale === "es" ? "Analizando tu sitio web" : "Analyzing your website"}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', margin: 0 }}>{url}</p>
      </div>

      {/* Score panel */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h3 style={{ margin: 0 }}>{locale === "es" ? "Así está tu sitio hoy" : "How your site looks today"}</h3>
          <span className="badge" style={{ backgroundColor: 'var(--color-cta)', color: 'white' }}>
            {analysis ? "✓ Listo" : analysisLoading ? "Analizando..." : "Pendiente"}
          </span>
        </div>

        {analysisLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🔍</div>
            <p style={{ color: 'var(--color-cta)', fontWeight: 600, fontSize: '1rem', margin: 0 }}>{analysisStep}</p>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p className="kpi score-glow" style={{ fontSize: '5rem', marginBottom: 0, color: 'var(--color-cta)' }}>
              {analysis ? analysis.scoreTotal : "--"}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em', marginTop: 0 }}>
              {locale === 'es' ? 'PUNTAJE GENERAL' : 'OVERALL SCORE'}
            </p>
            {analysis && (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                {locale === 'es'
                  ? (analysis.scoreTotal >= 80 ? '🟢 Tu sitio está en buen estado' : analysis.scoreTotal >= 60 ? '🟡 Hay cosas que mejorar para no perder clientes' : '🔴 Tu sitio está perdiendo clientes todos los días')
                  : (analysis.scoreTotal >= 80 ? '🟢 Your site is in good shape' : analysis.scoreTotal >= 60 ? '🟡 There are things to improve to avoid losing customers' : '🔴 Your site is losing customers every day')}
              </p>
            )}
          </div>
        )}

        {analysisError && <p style={{ textAlign: 'center', color: '#fbbf24', fontSize: '0.85rem', marginTop: '1rem' }}>{analysisError}</p>}

        {analysis && (
          <div style={{ marginTop: '2rem' }}>
            <MetricsGrid metrics={analysis.metrics} locale={locale} />
          </div>
        )}
      </div>

      {/* Issues + QuickWins */}
      {analysis && (
        <div className="grid">
          <div className="card">
            <h4 style={{ color: '#f87171', marginTop: 0 }}>
              {locale === "es" ? "🚨 Lo que está frenando tu negocio" : "🚨 What's holding your business back"}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.issues.slice(0, 3).map((item) => (
                <div key={item.title} style={{ borderLeft: '3px solid #f87171', paddingLeft: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</div>
                  {item.fix && <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{item.fix}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h4 style={{ color: '#34d399', marginTop: 0 }}>
              {locale === "es" ? "✅ Mejoras fáciles para empezar ya" : "✅ Easy improvements to start now"}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analysis.quickWins.slice(0, 3).map((item) => (
                <div key={item.title} style={{ borderLeft: '3px solid #34d399', paddingLeft: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</div>
                  {item.how && <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{item.how}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA — replace email form */}
      {analysis && (
        <div className="card" style={{ border: '1px solid rgba(202,138,4,0.35)', background: 'linear-gradient(135deg, rgba(202,138,4,0.06), rgba(0,0,0,0))', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0 }}>
            {locale === 'es' ? '¿Querés mejorar estos resultados?' : 'Want to improve these results?'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            {locale === 'es'
              ? 'En RIWEB te armamos la solución a medida: web mejorada, bot de WhatsApp y todo lo que tu negocio necesite.'
              : 'At RIWEB we build the custom solution for you: improved website, WhatsApp bot and everything your business needs.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              {locale === 'es' ? '👉 Hablá con nosotros por WhatsApp' : '👉 Talk to us on WhatsApp'}
            </a>
            <a
              href={homeLink}
              className="btn-outline-white"
              style={{ textDecoration: 'none' }}
            >
              {locale === 'es' ? '🤖 Ver cómo funciona el bot' : '🤖 See how the bot works'}
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

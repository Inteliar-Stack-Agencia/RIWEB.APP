import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";

// Lines that cycle in the code simulation
const CODE_LINES = [
  { text: 'const audit = await riweb.scan(legacy_url);', color: '#a78bfa' },
  { text: 'if (is_old_code) modernize_stack();', color: '#34d399' },
  { text: 'const aiAgent = await deploy_ai_asistente();', color: '#60a5fa' },
  { text: 'db.leads.convert({ source: "old_site" });', color: '#f59e0b' },
  { text: 'optimize_loading_speed({ target: "< 1s" });', color: '#34d399' },
  { text: 'return { modernized: true, sales_boost: "+200%" };', color: '#34d399' },
  { text: 'await deploy_next_gen_web({ ia_integrated: true });', color: '#a78bfa' },
  { text: 'metrics.push({ new_customers: 24, roi: "8x" });', color: '#60a5fa' },
];

function CodeSimulation() {
  const [visibleLines, setVisibleLines] = useState<{ text: string; color: string; id: number }[]>([]);

  useEffect(() => {
    let idx = 0;
    let lineId = 0;

    const interval = setInterval(() => {
      const line = CODE_LINES[idx % CODE_LINES.length];
      setVisibleLines(prev => {
        const next = [...prev, { ...line, id: lineId++ }];
        return next.slice(-6); // show max 6 lines
      });
      idx++;
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(202,138,4,0.25)',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
      fontSize: '0.82rem',
      lineHeight: 1.7,
      backdropFilter: 'blur(8px)',
      minHeight: '200px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Terminal header dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
        <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'inherit' }}>modernization-engine.ts</span>
      </div>
      {visibleLines.map((line, i) => (
        <div
          key={line.id}
          style={{
            color: line.color,
            opacity: i === visibleLines.length - 1 ? 1 : 0.5 + (i / visibleLines.length) * 0.5,
            transition: 'opacity 0.4s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.75rem', userSelect: 'none' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          {line.text}
          {i === visibleLines.length - 1 && (
            <span style={{ animation: 'blink 1s step-end infinite', color: '#ca8a04' }}>█</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HomePage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/audit?url=${encodeURIComponent(url)}`);
  };

  const businessWins = locale === "es"
    ? [
      "Incremento drástico en la captura de clientes",
      "Reducción de costos operativos mediante IA",
      "Experiencia de carga instantánea (Core Web Vitals)",
      "Seguridad blindada contra ciberataques modernos",
      "Integración de agentes de IA y Chatbots inteligentes",
      "Reconversión de código obsoleto a tecnología 2026"
    ]
    : [
      "Dramatic increase in customer acquisition",
      "AI-driven operational cost reduction",
      "Instant loading experience (Core Web Vitals)",
      "Bulletproof security against modern cyber threats",
      "Smart AI Agents and Intelligent Chatbots",
      "Legacy code rebirth into 2026 technology"
    ];

  const whyModernize = locale === "es"
    ? [
      "Tu sitio actual es un gasto, no una inversión",
      "El código viejo ahuyenta clientes y a Google",
      "La IA ya no es opcional, es tu nueva ventaja",
      "Tu competencia ya está modernizando su stack",
      "Automatización total del flujo de ventas",
      "Soporte 24/7 sin humanos con Agentes de IA"
    ]
    : [
      "Your current site is an expense, not an investment",
      "Old code scares away customers and Google",
      "AI is no longer optional, it's your new edge",
      "Your competitors are already modernizing their stack",
      "Total sales flow automation",
      "24/7 human-less support with AI Agents"
    ];

  return (
    <section className="landing-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="landing-brand">RIWEB PRO 2026</div>
      <h1 className="landing-title">
        {locale === "es"
          ? "Dale una nueva vida a tu web antigua con IA"
          : "Breathe new life into your legacy web with AI"}
      </h1>
      <p className="landing-subtitle">
        {locale === "es"
          ? "Escaneamos tu código legado para reconvertirlo en una máquina de ventas moderna, rápida y automatizada."
          : "We scan your legacy code to transform it into a modern, lightning-fast, and automated sales powerhouse."}
      </p>

      {/* Code Simulation Block */}
      <div style={{ maxWidth: '640px', margin: '0 auto 3rem', width: '100%' }}>
        <CodeSimulation />
      </div>

      <form className="prompt-box" onSubmit={submit}>
        <input
          id="url-input"
          required
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={locale === "es" ? "Ingresá la URL de tu negocio..." : "Enter your business URL..."}
        />
        <button className="btn-primary" type="submit">
          {locale === "es" ? "✦ Iniciar Transformación" : "✦ Start Transformation"}
        </button>
      </form>

      <div style={{ marginTop: '6rem' }}>
        <section className="card landing-section">
          <h2>{locale === "es" ? "ADN de Modernización" : "Modernization DNA"}</h2>
          <ul className="service-list">
            {businessWins.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="card landing-section">
          <h2>{locale === "es" ? "De Web Obsoleta a IA Nativa" : "From Legacy to AI Native"}</h2>
          <ol className="step-list">
            <li>
              <div>
                <strong>{locale === "es" ? "Diagnóstico de Valor" : "Value Diagnosis"}</strong>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>{locale === "es" ? "Detectamos dónde tu tecnología actual te está haciendo perder dinero." : "We identify where your current tech is making you lose money."}</p>
              </div>
            </li>
            <li>
              <div>
                <strong>{locale === "es" ? "ReBirth Digital" : "Digital ReBirth"}</strong>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>{locale === "es" ? "Plan de reconversión de código viejo a arquitecturas de alto rendimiento." : "Reconversion plan from legacy code to high-performance architectures."}</p>
              </div>
            </li>
            <li>
              <div>
                <strong>{locale === "es" ? "Inyección de IA" : "AI Injection"}</strong>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>{locale === "es" ? "Instalamos agentes inteligentes que venden y responden por vos 24/7." : "We deploy smart agents that sell and answer for you 24/7."}</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="card landing-section">
          <h2>{locale === "es" ? "¿Por qué modernizar hoy?" : "Why modernize today?"}</h2>
          <ul className="service-list check-list">
            {whyModernize.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="final-cta" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>{locale === "es" ? "¿Listo para facturar más con tecnología 2026?" : "Ready to scale your business with 2026 tech?"}</h2>
            <p className="muted" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.2rem' }}>
              {locale === "es"
                ? "Obtén un plan estratégico gratuito y descubre el potencial de tu web con IA."
                : "Get a free strategic plan and discover your web's potential with AI."}
            </p>
            <div className="final-cta-actions">
              <button type="button" className="btn-white">
                {locale === "es" ? "📞 Agendar Sesión IA" : "📞 Schedule AI Session"}
              </button>
              <button type="button" className="btn-outline-white">
                {locale === "es" ? "📄 Ver Reporte Estratégico" : "📄 View Strategic Report"}
              </button>
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '140%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(202, 138, 4, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
        </section>
      </div>
    </section>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";
import DemoChat from "../components/DemoChat";

// Code lines updated to reflect AI sales bot theme
const CODE_LINES = [
  { text: 'const bot = await riweb.createSalesBot({ business });', color: '#a78bfa' },
  { text: 'bot.onMessage(async (msg) => reply(msg));', color: '#34d399' },
  { text: 'await bot.connectWhatsApp({ available: "24/7" });', color: '#60a5fa' },
  { text: 'leads.push({ source: "whatsapp", converted: true });', color: '#f59e0b' },
  { text: 'sales.automate({ follow_up: true, booking: true });', color: '#34d399' },
  { text: 'return { revenue_boost: "+180%", effort: "zero" };', color: '#34d399' },
  { text: 'await notify.owner({ new_sale: true, amount: "$340" });', color: '#a78bfa' },
  { text: 'bot.status // "answering 24 customers right now"', color: '#60a5fa' },
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
        return next.slice(-6);
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
        <span style={{ marginLeft: '0.75rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'inherit' }}>ai-sales-bot.ts</span>
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

  // Keep audit functionality intact
  const submitAudit = (e: FormEvent) => {
    e.preventDefault();
    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/audit?url=${encodeURIComponent(url)}`);
  };

  const serviceFeatures = locale === "es"
    ? [
      "Tu bot responde clientes en WhatsApp mientras dormís",
      "Agenda citas, toma pedidos y cierra ventas solo",
      "Sitio web profesional que carga en menos de 1 segundo",
      "Integración total con tu negocio sin trabajo manual",
      "Leads capturados y guardados automáticamente",
      "Soporte 24/7 sin contratar más personal",
    ]
    : [
      "Your bot answers customers on WhatsApp while you sleep",
      "Books appointments, takes orders and closes sales automatically",
      "Professional website loading in under 1 second",
      "Full integration with your business, zero manual work",
      "Leads captured and saved automatically",
      "24/7 support without hiring more staff",
    ];

  const howItWorks = locale === "es"
    ? [
      { title: "Contanos qué vendés", desc: "En 10 minutos te armamos el bot y el sitio web." },
      { title: "Activamos tu bot en WhatsApp", desc: "Empieza a responder clientes solo, desde el primer día." },
      { title: "Vos cobrás, el bot trabaja", desc: "Seguimiento automático, ventas sin esfuerzo." },
    ]
    : [
      { title: "Tell us what you sell", desc: "In 10 minutes we build your bot and website." },
      { title: "We activate your bot on WhatsApp", desc: "It starts answering customers automatically, day one." },
      { title: "You earn, the bot works", desc: "Automatic follow-up, sales without effort." },
    ];

  const whyNow = locale === "es"
    ? [
      "Tus competidores ya están usando IA para vender más",
      "Cada cliente sin respuesta rápida es una venta perdida",
      "Un bot trabaja 24/7 sin salario ni errores",
      "WhatsApp es donde tus clientes ya están",
      "El costo de no automatizar es mayor cada mes",
      "Configurable en un día, funciona para siempre",
    ]
    : [
      "Your competitors are already using AI to sell more",
      "Every unanswered customer is a lost sale",
      "A bot works 24/7 with no salary and no mistakes",
      "WhatsApp is where your customers already are",
      "The cost of not automating grows every month",
      "Set up in one day, runs forever",
    ];

  return (
    <section className="landing-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* Brand badge */}
      <div className="landing-brand">RIWEB</div>

      {/* Hero headline — updated for sales conversion */}
      <h1 className="landing-title">
        {locale === "es"
          ? "Tu negocio vendiendo y respondiendo solo, mientras dormís"
          : "Your business selling and replying automatically while you sleep"}
      </h1>

      {/* Hero subheadline */}
      <p className="landing-subtitle">
        {locale === "es"
          ? "Creamos tu sitio web + asistente de ventas con IA que responde a tus clientes por WhatsApp 24/7"
          : "We create your website + AI sales assistant that answers your customers on WhatsApp 24/7"}
      </p>

      {/* Primary hero CTAs */}
      <div style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: "3rem",
      }}>
        {/* Replace href with actual WhatsApp number: https://wa.me/YOUR_NUMBER */}
        <a href="#demo" className="btn-primary" style={{ textDecoration: "none" }}>
          {locale === "es" ? "Crear mi bot ahora" : "Create my AI sales bot"}
        </a>
        <a href="#demo" className="btn-outline-white" style={{ textDecoration: "none" }}>
          Ver demo
        </a>
      </div>

      {/* Interactive demo section */}
      <div style={{ marginBottom: "3.5rem" }}>
        <p style={{
          textAlign: "center",
          marginBottom: "1.25rem",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          {locale === "es"
            ? "Escribí qué vendés y mirá cómo responde tu bot:"
            : "Type what you sell and see your bot respond:"}
        </p>
        <DemoChat />
      </div>

      {/* Code simulation — shows the engine behind the scenes */}
      <div style={{ maxWidth: '640px', margin: '0 auto 5rem', width: '100%' }}>
        <CodeSimulation />
      </div>

      {/* Content sections */}
      <div>
        <section className="card landing-section">
          <h2>{locale === "es" ? "Lo que incluye tu bot" : "What your bot does"}</h2>
          <ul className="service-list">
            {serviceFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="card landing-section">
          <h2>{locale === "es" ? "¿Cómo funciona?" : "How it works"}</h2>
          <ol className="step-list">
            {howItWorks.map((step) => (
              <li key={step.title}>
                <div>
                  <strong>{step.title}</strong>
                  <p className="muted" style={{ margin: '0.25rem 0 0' }}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card landing-section">
          <h2>{locale === "es" ? "¿Por qué empezar hoy?" : "Why start today?"}</h2>
          <ul className="service-list check-list">
            {whyNow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Secondary: keep audit form accessible for existing website owners */}
        <section className="card landing-section" style={{ textAlign: "center" }}>
          <h2 style={{ textAlign: "center" }}>
            {locale === "es" ? "¿Ya tenés un sitio web?" : "Already have a website?"}
          </h2>
          <p className="muted" style={{ marginBottom: "1.5rem" }}>
            {locale === "es"
              ? "Analizamos gratis por qué no te trae clientes y qué cambiar."
              : "We analyze for free why it's not bringing you customers and what to fix."}
          </p>
          <form className="prompt-box" onSubmit={submitAudit} style={{ margin: "0 auto" }}>
            <input
              id="url-input"
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={locale === "es" ? "Ingresá la URL de tu sitio..." : "Enter your website URL..."}
            />
            <button className="btn-primary" type="submit">
              {locale === "es" ? "✦ Analizar gratis" : "✦ Analyze free"}
            </button>
          </form>
        </section>

        {/* Final CTA section with improved copy */}
        <section className="final-cta" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>
              {locale === "es"
                ? "¿Listo para vender más sin trabajar más?"
                : "Ready to sell more without working more?"}
            </h2>
            <p className="muted" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.1rem' }}>
              {locale === "es"
                ? "Tu bot empieza a responder clientes desde hoy."
                : "Your bot starts answering customers today."}
            </p>
            <div className="final-cta-actions">
              {/* Replace with actual WhatsApp number in both links */}
              <a href="#demo" className="btn-white" style={{ textDecoration: "none" }}>
                {locale === "es" ? "Crear mi bot ahora" : "Crear mi bot ahora"}
              </a>
              <a href="#demo" className="btn-outline-white" style={{ textDecoration: "none" }}>
                Hablar por WhatsApp
              </a>
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

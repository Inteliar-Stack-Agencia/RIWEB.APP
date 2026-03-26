import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";
import DemoChatPro from "../components/DemoChatPro";

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

const WA_LINK = "https://wa.me/549XXXXXXXXXX"; // <-- reemplazá con tu número real

export default function HomePage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  // Keep audit functionality intact
  const submitAudit = (e: FormEvent) => {
    e.preventDefault();
    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/audit?url=${encodeURIComponent(url)}`);
  };

  // ── Sección 1: Lo que vas a lograr ──────────────────────────────────────
  const benefitCards = locale === "es"
    ? [
      {
        icon: "📈",
        title: "Más ventas automáticas",
        desc: "Tu bot responde cada consulta al instante, incluso mientras dormís.",
        color: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.25)",
      },
      {
        icon: "🚨",
        title: "Dejá de perder clientes",
        desc: "Cada mensaje sin responder es una venta menos. Esto lo soluciona.",
        color: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.25)",
      },
      {
        icon: "🤖",
        title: "Tu propio vendedor IA",
        desc: "Podés ajustar cómo responde, qué ofrece y cómo vende.",
        color: "rgba(168,85,247,0.12)",
        border: "rgba(168,85,247,0.25)",
      },
      {
        icon: "🌐",
        title: "Web que convierte",
        desc: "No solo te ven… te escriben y compran.",
        color: "rgba(59,130,246,0.12)",
        border: "rgba(59,130,246,0.25)",
      },
      {
        icon: "💬",
        title: "Todo conectado a WhatsApp",
        desc: "Donde ya están tus clientes.",
        color: "rgba(249,115,22,0.12)",
        border: "rgba(249,115,22,0.25)",
      },
    ]
    : [
      {
        icon: "📈",
        title: "More automatic sales",
        desc: "Your bot answers every query instantly, even while you sleep.",
        color: "rgba(34,197,94,0.12)",
        border: "rgba(34,197,94,0.25)",
      },
      {
        icon: "🚨",
        title: "Stop losing customers",
        desc: "Every unanswered message is a lost sale. This solves it.",
        color: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.25)",
      },
      {
        icon: "🤖",
        title: "Your own AI seller",
        desc: "You can adjust how it responds, what it offers and how it sells.",
        color: "rgba(168,85,247,0.12)",
        border: "rgba(168,85,247,0.25)",
      },
      {
        icon: "🌐",
        title: "Web that converts",
        desc: "They don't just see you… they message and buy.",
        color: "rgba(59,130,246,0.12)",
        border: "rgba(59,130,246,0.25)",
      },
      {
        icon: "💬",
        title: "All connected to WhatsApp",
        desc: "Where your customers already are.",
        color: "rgba(249,115,22,0.12)",
        border: "rgba(249,115,22,0.25)",
      },
    ];

  // ── Sección 2: Si no automatizás ────────────────────────────────────────
  const urgencyItems = locale === "es"
    ? [
      "Tus clientes escriben y esperan respuesta inmediata",
      "Si tardás, se van con otro",
      "Responder todo manualmente no escala",
      "Un bot trabaja 24/7 sin cansarse",
      "Cada día sin esto = ventas perdidas",
    ]
    : [
      "Your customers write and expect an immediate reply",
      "If you're slow, they go to someone else",
      "Answering everything manually doesn't scale",
      "A bot works 24/7 without getting tired",
      "Every day without this = lost sales",
    ];

  // ── Sección 3: ¿Cómo funciona? (sin cambios) ───────────────────────────
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

  return (
    <section className="landing-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* Brand badge */}
      <div className="landing-brand">RIWEB</div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <h1 className="landing-title">
        {locale === "es"
          ? "Tu negocio vendiendo y respondiendo solo mientras dormís"
          : "Your business selling and responding automatically while you sleep"}
      </h1>

      <p className="landing-subtitle">
        {locale === "es"
          ? "Creamos tu web + bot con IA que atiende WhatsApp, responde consultas y cierra ventas 24/7. Y si lo necesitás, también te armamos un sistema para gestionar todo desde un solo lugar."
          : "We create your web + AI bot that handles WhatsApp, answers queries and closes sales 24/7. And if you need it, we also build a system to manage everything from one place."}
      </p>

      {/* Hero CTAs */}
      <div style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: "3rem",
      }}>
        <a href="#demo" className="btn-primary" style={{ textDecoration: "none" }}>
          {locale === "es" ? "👉 Probar demo gratis" : "👉 Try free demo"}
        </a>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-white"
          style={{ textDecoration: "none" }}
        >
          {locale === "es" ? "👉 Hablá por WhatsApp" : "👉 Talk on WhatsApp"}
        </a>
      </div>

      {/* ── DEMO ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          {locale === "es" ? "Probá cómo respondería tu negocio" : "See how your business would respond"}
        </h2>
        <p style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}>
          {locale === "es"
            ? "Escribí qué vendés y mirá cómo trabajaría tu bot"
            : "Type what you sell and see how your bot would work"}
        </p>
        <DemoChatPro />
      </div>

      {/* Code simulation */}
      <div style={{ maxWidth: '640px', margin: '0 auto 5rem', width: '100%' }}>
        <CodeSimulation />
      </div>

      {/* ── SECCIÓN 1: Lo que vas a lograr ───────────────────────────────── */}
      <div>
        <section className="card landing-section">
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {locale === "es" ? "Lo que vas a lograr con Riweb" : "What you'll achieve with Riweb"}
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}>
            {benefitCards.map((card) => (
              <div
                key={card.title}
                style={{
                  background: card.color,
                  border: `1px solid ${card.border}`,
                  borderRadius: "14px",
                  padding: "1.1rem 1rem",
                }}
              >
                <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{card.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.35rem" }}>
                  {card.title}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECCIÓN 2: Si no automatizás ─────────────────────────────── */}
        <section className="card landing-section">
          <h2 style={{ marginBottom: "1.25rem" }}>
            {locale === "es"
              ? "Si no automatizás, estás perdiendo plata"
              : "If you don't automate, you're losing money"}
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {urgencyItems.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.65rem",
                  fontSize: "0.95rem",
                  color: "var(--text-muted)",
                }}
              >
                <span style={{ color: "#f59e0b", fontWeight: 700, flexShrink: 0 }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── NUEVA SECCIÓN: No es solo un bot ─────────────────────────── */}
        <section className="card landing-section">
          <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            {locale === "es" ? "No es solo un bot. Es un sistema completo" : "Not just a bot. A complete system"}
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.75rem", fontSize: "0.95rem" }}>
            {locale === "es"
              ? "No solo automatizamos tus ventas. También podés tener tu propio sistema para gestionar tu negocio."
              : "We don't just automate your sales. You can also have your own system to manage your business."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Tier 1 */}
            <div style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "14px",
              padding: "1.1rem 1.25rem",
            }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
                🔹 {locale === "es" ? "Web + Bot IA" : "Web + AI Bot"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(202,138,4,0.9)", marginBottom: "0.4rem", fontWeight: 600 }}>
                {locale === "es" ? "Ideal para empezar rápido" : "Ideal to start fast"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {locale === "es"
                  ? "Web profesional + asistente que responde y vende por WhatsApp."
                  : "Professional web + assistant that responds and sells on WhatsApp."}
              </div>
            </div>

            {/* Tier 2 — destacado */}
            <div style={{
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.35)",
              borderRadius: "14px",
              padding: "1.1rem 1.25rem",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                top: "0.6rem",
                right: "0.75rem",
                background: "rgba(168,85,247,0.25)",
                border: "1px solid rgba(168,85,247,0.5)",
                borderRadius: "999px",
                padding: "0.15rem 0.6rem",
                fontSize: "0.7rem",
                color: "#c084fc",
                fontWeight: 600,
              }}>
                🔥 {locale === "es" ? "el fuerte" : "most popular"}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
                🔹 {locale === "es" ? "Web + Bot + Sistema de gestión" : "Web + Bot + Management System"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(202,138,4,0.9)", marginBottom: "0.4rem", fontWeight: 600 }}>
                {locale === "es" ? "Para negocios que quieren escalar" : "For businesses that want to scale"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {locale === "es"
                  ? "Controlá pedidos, clientes, stock o agenda desde un dashboard simple."
                  : "Manage orders, customers, stock or schedule from a simple dashboard."}
              </div>
            </div>

            {/* Tier 3 */}
            <div style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "14px",
              padding: "1.1rem 1.25rem",
            }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
                🔹 {locale === "es" ? "Desarrollo a medida" : "Custom development"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(202,138,4,0.9)", marginBottom: "0.4rem", fontWeight: 600 }}>
                {locale === "es" ? "Si tu negocio es más complejo" : "If your business is more complex"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {locale === "es"
                  ? "Te construimos exactamente lo que necesitás."
                  : "We build exactly what you need."}
              </div>
            </div>
          </div>
        </section>

        {/* ── Cómo funciona (sin cambios) ───────────────────────────────── */}
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

        {/* ── CTA FINAL ────────────────────────────────────────────────── */}
        <section className="final-cta" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2>
              {locale === "es"
                ? "Dejemos de perder clientes desde hoy"
                : "Let's stop losing customers starting today"}
            </h2>
            <p className="muted" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '3rem', fontSize: '1.1rem' }}>
              {locale === "es"
                ? "En minutos podés tener tu propio sistema funcionando."
                : "In minutes you can have your own system running."}
            </p>
            <div className="final-cta-actions">
              <a href="#demo" className="btn-white" style={{ textDecoration: "none" }}>
                {locale === "es" ? "👉 Crear mi bot ahora" : "👉 Create my bot now"}
              </a>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white"
                style={{ textDecoration: "none" }}
              >
                {locale === "es" ? "👉 Hablá por WhatsApp" : "👉 Talk on WhatsApp"}
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

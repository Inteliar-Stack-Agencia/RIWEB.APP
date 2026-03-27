import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";
import DemoChatPro from "../components/DemoChatPro";
import { useSEO } from "../hooks/useSEO";

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

const WA_LINK = "https://wa.me/5491165689145";

// ─── Floating WhatsApp button ────────────────────────────────────────────────
function FloatingWA({ locale }: { locale: Locale }) {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      title={locale === "es" ? "Hablá por WhatsApp" : "Talk on WhatsApp"}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#25d366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        textDecoration: "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(37,211,102,0.6)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(37,211,102,0.45)";
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.549 4.117 1.512 5.855L0 24l6.335-1.493A11.928 11.928 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.797 9.797 0 01-5.003-1.374l-.358-.213-3.758.886.938-3.658-.234-.376A9.799 9.799 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    </a>
  );
}

export default function HomePage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  useSEO(locale === "es" ? {
    title: "RIWEB | Bot de WhatsApp con IA para tu negocio — Ventas 24/7",
    description: "Creamos tu web y bot de IA que atiende WhatsApp, responde clientes y cierra ventas mientras dormís. Soluciones a medida para negocios en Argentina.",
    canonical: "https://riweb.app/",
    lang: "es",
  } : {
    title: "RIWEB | AI WhatsApp Bot for your business — Sales 24/7",
    description: "We build your web and AI bot that handles WhatsApp, responds to customers and closes sales while you sleep. Custom solutions for your business.",
    canonical: "https://riweb.app/en",
    lang: "en",
  });

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
      { title: "Contanos qué vendés", desc: "Nos juntamos, entendemos tu negocio y armamos la solución a medida." },
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
      <FloatingWA locale={locale} />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* ── HERO — fills full viewport ────────────────────────────────────── */}
      <div style={{
        minHeight: "calc(100svh - 80px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        paddingTop: "clamp(3rem, 10vh, 6rem)",
        paddingBottom: "2rem",
      }}>

      <h1 className="landing-title">
        {locale === "es"
          ? "Tu negocio vendiendo y respondiendo solo mientras duermes"
          : "Your business selling and responding automatically while you sleep"}
      </h1>

      <p className="landing-subtitle" style={{ fontSize: "1.35rem", background: "linear-gradient(135deg, #ffffff 30%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", maxWidth: "580px", margin: "0 auto 0.75rem", lineHeight: 1.6 }}>
        {locale === "es"
          ? "Creamos tu web + bot con IA que atiende WhatsApp y cierra ventas 24/7. Si lo necesitás, también armamos tu sistema de gestión."
          : "We build your web + AI bot that handles WhatsApp and closes sales 24/7. Need more? We also build your management system."}
      </p>

      {/* Agent AI badge */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <span style={{
          display: "inline-block",
          padding: "0.3rem 1.1rem",
          borderRadius: "999px",
          border: "1px solid rgba(245,158,11,0.4)",
          background: "rgba(245,158,11,0.08)",
          fontSize: "0.9rem",
          color: "#f59e0b",
          fontWeight: 600,
          letterSpacing: "0.01em",
        }}>
          {locale === "es"
            ? "🤖 Bot con IA que funciona como un agente de ventas"
            : "🤖 AI bot that works like a sales agent"}
        </span>
      </div>

      {/* Interliar Stack attribution */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span style={{
          display: "inline-block",
          fontSize: "0.78rem",
          color: "rgba(202,138,4,0.7)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}>
          {locale === "es" ? "Una solución de" : "A solution by"}{" "}
          <strong style={{ color: "rgba(202,138,4,1)" }}>Interliar Stack</strong>
        </span>
      </div>

      {/* Hero CTAs */}
      <div style={{
        display: "flex",
        gap: "1rem",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: "0",
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

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "2rem",
        padding: "1.5rem 1rem 2.5rem",
      }}>
        {[
          { n: "50+", label: locale === "es" ? "negocios activos" : "active businesses" },
          { n: "24/7", label: locale === "es" ? "sin interrupciones" : "non-stop" },
          { n: "< 2 min", label: locale === "es" ? "tiempo de respuesta" : "response time" },
          { n: "3×", label: locale === "es" ? "más consultas atendidas" : "more queries handled" },
        ].map(stat => (
          <div key={stat.n} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#f59e0b", lineHeight: 1 }}>{stat.n}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem", fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      </div> {/* end hero full-viewport wrapper */}

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
        <DemoChatPro locale={locale} />
      </div>

      {/* Code simulation */}
      <div style={{ maxWidth: '640px', margin: '0 auto 5rem', width: '100%' }}>
        <CodeSimulation />
      </div>

      {/* ── SECCIÓN 1: Lo que vas a lograr ───────────────────────────────── */}
      <div>
        <section className="card landing-section">
          <h2 style={{ textAlign: "center", marginBottom: "0.6rem" }}>
            {locale === "es" ? "Lo que vas a lograr con Riweb" : "What you'll achieve with Riweb"}
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {locale === "es"
              ? "En RIWEB creamos soluciones a medida para tu negocio"
              : "At RIWEB we create custom solutions for your business"}
          </p>
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
            {locale === "es"
              ? "No es solo un bot. Creamos el sistema completo para tu negocio"
              : "Not just a bot. We build the complete system for your business"}
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
            {locale === "es"
              ? "En RIWEB desarrollamos soluciones a medida: web, automatización con IA y sistemas de gestión adaptados a cómo trabaja tu negocio."
              : "At RIWEB we develop custom solutions: web, AI automation and management systems tailored to how your business works."}
          </p>
          {/* No usamos plantillas */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span style={{
              display: "inline-block",
              padding: "0.3rem 1rem",
              borderRadius: "999px",
              border: "1px solid rgba(202,138,4,0.35)",
              background: "rgba(202,138,4,0.08)",
              fontSize: "0.8rem",
              color: "rgba(202,138,4,0.9)",
              fontWeight: 500,
            }}>
              {locale === "es"
                ? "✦ No usamos plantillas. Lo adaptamos a tu negocio."
                : "✦ No templates. Built around your business."}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Tier 1 */}
            <div style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "14px",
              padding: "1.1rem 1.25rem",
            }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>
                🔹 {locale === "es" ? "Web + Bot IA — implementación a medida" : "Web + AI Bot — custom implementation"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(202,138,4,0.9)", marginBottom: "0.4rem", fontWeight: 600 }}>
                {locale === "es" ? "Ideal para empezar rápido" : "Ideal to start fast"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {locale === "es"
                  ? "Web profesional + asistente que responde y vende por WhatsApp, adaptado a tu negocio."
                  : "Professional web + assistant that responds and sells on WhatsApp, adapted to your business."}
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
                🔹 {locale === "es" ? "Web + Bot + Sistema de gestión desarrollado para vos" : "Web + Bot + Management System built for you"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "rgba(202,138,4,0.9)", marginBottom: "0.4rem", fontWeight: 600 }}>
                {locale === "es" ? "Para negocios que quieren escalar" : "For businesses that want to scale"}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {locale === "es"
                  ? "Controlá pedidos, clientes, stock o agenda desde un dashboard construido según cómo trabaja tu negocio."
                  : "Manage orders, customers, stock or schedule from a dashboard built around how your business works."}
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

        {/* ── PRECIOS ───────────────────────────────────────────────────── */}
        <section className="card landing-section">
          <h2 style={{ textAlign: "center", marginBottom: "0.4rem" }}>
            {locale === "es" ? "¿Cuánto cuesta?" : "How much does it cost?"}
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "1.75rem" }}>
            {locale === "es"
              ? "Inversión única, sin costos sorpresa. Cada proyecto es a medida."
              : "One-time investment, no surprise costs. Every project is custom-built."}
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}>
            {/* Tier 1 */}
            <div style={{
              background: "rgba(59,130,246,0.07)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "16px",
              padding: "1.4rem 1.25rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                {locale === "es" ? "Starter" : "Starter"}
              </div>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#60a5fa", lineHeight: 1 }}>
                {locale === "es" ? "Desde $XXX.000" : "From $XXX"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "0.2rem 0 1rem" }}>
                {locale === "es" ? "ARS / proyecto" : "USD / project"}
              </div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {locale === "es"
                  ? "Web + Bot IA básico listo para vender."
                  : "Web + basic AI bot ready to sell."}
              </div>
            </div>
            {/* Tier 2 — destacado */}
            <div style={{
              background: "rgba(168,85,247,0.1)",
              border: "2px solid rgba(168,85,247,0.4)",
              borderRadius: "16px",
              padding: "1.4rem 1.25rem",
              textAlign: "center",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                background: "rgba(168,85,247,0.9)", borderRadius: "999px",
                padding: "0.2rem 0.9rem", fontSize: "0.7rem", fontWeight: 700, color: "white",
                whiteSpace: "nowrap",
              }}>
                🔥 {locale === "es" ? "MÁS ELEGIDO" : "MOST POPULAR"}
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Pro
              </div>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#c084fc", lineHeight: 1 }}>
                {locale === "es" ? "Desde $XXX.000" : "From $XXX"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "0.2rem 0 1rem" }}>
                {locale === "es" ? "ARS / proyecto" : "USD / project"}
              </div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {locale === "es"
                  ? "Web + Bot + Sistema de gestión a medida."
                  : "Web + Bot + Custom management system."}
              </div>
            </div>
            {/* Tier 3 */}
            <div style={{
              background: "rgba(34,197,94,0.07)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "16px",
              padding: "1.4rem 1.25rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                {locale === "es" ? "A medida" : "Custom"}
              </div>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#34d399", lineHeight: 1 }}>
                {locale === "es" ? "A consultar" : "Contact us"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "0.2rem 0 1rem" }}>
                {locale === "es" ? "según proyecto" : "per project"}
              </div>
              <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {locale === "es"
                  ? "Proyectos complejos o integraciones especiales."
                  : "Complex projects or special integrations."}
              </div>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: "1.25rem", marginBottom: 0 }}>
            {locale === "es"
              ? "💬 Los precios son orientativos. Hablanos para un presupuesto a medida sin compromiso."
              : "💬 Prices are indicative. Contact us for a custom quote with no commitment."}
          </p>
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

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="card landing-section">
          <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {locale === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {(locale === "es" ? [
              {
                q: "🤖 ¿Bot o agente IA? ¿Cuál es la diferencia?",
                a: "Un bot responde mensajes simples. Un agente IA entiende lo que el cliente quiere, hace preguntas y busca cerrar la venta. En RIWEB usamos bots con inteligencia de agente IA. No solo responde… vende.",
              },
              {
                q: "💬 ¿Esto realmente vende o solo responde?",
                a: "Está diseñado para vender. Responde rápido, guía al cliente y lo lleva a tomar una decisión.",
              },
              {
                q: "📲 ¿Funciona con WhatsApp?",
                a: "Sí. De hecho, es donde mejor funciona. Tus clientes ya están ahí.",
              },
              {
                q: "⚙️ ¿Tengo que configurarlo yo?",
                a: "No. Nosotros lo dejamos funcionando listo para tu negocio.",
              },
              {
                q: "🧠 ¿Se puede adaptar a mi rubro?",
                a: "Sí. Se entrena con tu negocio: productos, precios, forma de vender.",
              },
              {
                q: "💸 ¿Esto reemplaza a una persona?",
                a: "No, pero te ahorra la mayoría de las respuestas repetitivas y te deja solo los clientes listos para comprar.",
              },
            ] : [
              {
                q: "🤖 Bot or AI agent? What's the difference?",
                a: "A bot answers simple messages. An AI agent understands what the customer wants, asks questions and tries to close the sale. At RIWEB we use bots with AI agent intelligence. It doesn't just respond… it sells.",
              },
              {
                q: "💬 Does it actually sell or just respond?",
                a: "It's designed to sell. It responds fast, guides the customer and leads them to make a decision.",
              },
              {
                q: "📲 Does it work with WhatsApp?",
                a: "Yes. In fact, that's where it works best. Your customers are already there.",
              },
              {
                q: "⚙️ Do I have to configure it myself?",
                a: "No. We set it up and leave it ready for your business.",
              },
              {
                q: "🧠 Can it adapt to my industry?",
                a: "Yes. It's trained with your business: products, prices, your way of selling.",
              },
              {
                q: "💸 Does this replace a person?",
                a: "No, but it handles most repetitive replies and leaves you only the customers ready to buy.",
              },
            ]).map((item) => (
              <div key={item.q} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
              }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{item.q}</div>
                <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIOS ──────────────────────────────────────────────── */}
        <section className="card landing-section">
          <h2 style={{ textAlign: "center", marginBottom: "0.4rem" }}>
            {locale === "es" ? "Lo que dicen los que ya lo usan" : "What those using it say"}
          </h2>
          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.75rem" }}>
            {locale === "es" ? "Resultados reales de negocios reales" : "Real results from real businesses"}
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
          }}>
            {(locale === "es" ? [
              {
                quote: "Antes perdía 5 turnos por semana porque no llegaba a responder rápido. Ahora el bot agenda solo y yo me entero cuando ya está confirmado.",
                name: "Marcos R.",
                role: "Centro de estética — Buenos Aires",
                result: "+5 turnos/semana",
              },
              {
                quote: "Mis ventas de productos subieron el primer mes. La gente pregunta el precio y el bot cierra la venta directo por WhatsApp.",
                name: "Carolina M.",
                role: "Pastelería personalizada — Córdoba",
                result: "Ventas +40%",
              },
              {
                quote: "Ahorro 3 horas por día. El bot califica los clientes antes de que yo los atienda. Solo hablo con los que están listos para comprar.",
                name: "Diego P.",
                role: "Consultor inmobiliario — Rosario",
                result: "−3 hs por día",
              },
            ] : [
              {
                quote: "I was losing 5 appointments a week because I couldn't respond fast enough. Now the bot books automatically and I find out when it's already confirmed.",
                name: "Marcos R.",
                role: "Esthetics center — Buenos Aires",
                result: "+5 bookings/week",
              },
              {
                quote: "My product sales went up in the first month. People ask for the price and the bot closes the sale directly on WhatsApp.",
                name: "Carolina M.",
                role: "Custom bakery — Córdoba",
                result: "Sales +40%",
              },
              {
                quote: "I save 3 hours a day. The bot qualifies customers before I talk to them. I only speak to those ready to buy.",
                name: "Diego P.",
                role: "Real estate consultant — Rosario",
                result: "−3 hrs/day",
              },
            ]).map(t => (
              <div key={t.name} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}>
                <div style={{ fontSize: "0.87rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.65, fontStyle: "italic" }}>
                  "{t.quote}"
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{
                    display: "inline-block",
                    background: "rgba(245,158,11,0.15)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: "999px",
                    padding: "0.15rem 0.65rem",
                    fontSize: "0.72rem",
                    color: "#f59e0b",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}>{t.result}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{t.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
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

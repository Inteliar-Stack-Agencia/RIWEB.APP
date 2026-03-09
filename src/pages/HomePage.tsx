import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";

function FeatureList({ locale }: { locale: Locale }) {
  const steps = locale === "es"
    ? [
      { text: "Hoy todo se busca en internet", icon: "🔍" },
      { text: "Tu negocio o marca debe aparecer ahí", icon: "📍" },
      { text: "RiWeb lo hace posible en pocas horas", icon: "BRAND" },
      { text: "Y sin gastar de más", icon: "💰" }
    ]
    : [
      { text: "Everything is searched online today", icon: "🔍" },
      { text: "Your business or brand must appear there", icon: "📍" },
      { text: "RiWeb makes it possible in just a few hours", icon: "BRAND" },
      { text: "Without overspending", icon: "💰" }
    ];

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(139, 92, 246, 0.3)', // Violet neon border
      boxShadow: '0 0 40px rgba(139, 92, 246, 0.12)', // Neon glow
      borderRadius: '24px',
      padding: '2.5rem 1.5rem',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      gap: '1.5rem',
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%'
    }}>
      {steps.map((item, i) => (
        <div key={i} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem'
        }}>
          {/* Icon Container */}
          <div style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: item.icon === 'BRAND' ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.08)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: 'inset 0 0 10px rgba(139, 92, 246, 0.1)',
            fontSize: '1.5rem'
          }}>
            {item.icon === 'BRAND' ? (
              <img src="/logo-new.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            ) : (
              item.icon
            )}
          </div>

          <span style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
            lineHeight: 1.3,
            maxWidth: '180px'
          }}>{item.text}</span>
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
      { icon: '🚀', text: "Incremento drástico en la captura de clientes", color: 'violet' },
      { icon: '🤖', text: "Reducción de costos operativos mediante IA", color: 'blue' },
      { icon: '⚡', text: "Experiencia de carga instantánea (Core Web Vitals)", color: 'amber' },
      { icon: '🛡️', text: "Seguridad blindada contra ciberataques modernos", color: 'green' },
      { icon: '💬', text: "Integración de agentes de IA y Chatbots inteligentes", color: 'cyan' },
      { icon: '💎', text: "Reconversión de código obsoleto a tecnología 2026", color: 'red' }
    ]
    : [
      { icon: '🚀', text: "Dramatic increase in customer acquisition", color: 'violet' },
      { icon: '🤖', text: "AI-driven operational cost reduction", color: 'blue' },
      { icon: '⚡', text: "Instant loading experience (Core Web Vitals)", color: 'amber' },
      { icon: '🛡️', text: "Bulletproof security against modern cyber threats", color: 'green' },
      { icon: '💬', text: "Smart AI Agents and Intelligent Chatbots", color: 'cyan' },
      { icon: '💎', text: "Legacy code rebirth into 2026 technology", color: 'red' }
    ];

  const whyModernize = locale === "es"
    ? [
      { icon: '💸', text: "Tu sitio actual es un gasto, no una inversión", color: 'red' },
      { icon: '📉', text: "El código viejo ahuyenta clientes y a Google", color: 'orange' },
      { icon: '🧠', text: "La IA ya no es opcional, es tu nueva ventaja", color: 'cyan' },
      { icon: '🏃', text: "Tu competencia ya está modernizando su stack", color: 'blue' },
      { icon: '💰', text: "Automatización total del flujo de ventas", color: 'gold' },
      { icon: '🤖', text: "Soporte 24/7 sin humanos con Agentes de IA", color: 'violet' }
    ]
    : [
      { icon: '💸', text: "Your current site is an expense, not an investment", color: 'red' },
      { icon: '📉', text: "Old code scares away customers and Google", color: 'orange' },
      { icon: '🧠', text: "AI is no longer optional, it's your new edge", color: 'cyan' },
      { icon: '🏃', text: "Your competitors are already modernizing their stack", color: 'blue' },
      { icon: '💰', text: "Total sales flow automation", color: 'gold' },
      { icon: '🤖', text: "24/7 human-less support with AI Agents", color: 'violet' }
    ];

  return (
    <section className="landing-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <h1 className="landing-title" style={{ fontSize: '4.2rem', lineHeight: 1.1, marginBottom: '2rem' }}>
        {locale === "es"
          ? "Haz que tu negocio o marca aparezca donde la gente busca hoy"
          : "Make your business or brand appear where people search today"}
      </h1>
      <p className="landing-subtitle" style={{ fontSize: '1.25rem', marginBottom: '3rem', maxWidth: '900px', marginInline: 'auto', lineHeight: 1.5 }}>
        {locale === "es" ? (
          <>
            Si ya tenés una web la mejoramos. Si no tenés, la creamos. Te ayudamos a que te encuentren en Google.
            Y además activamos WhatsApp y asistentes de IA para que <span style={{ color: 'var(--primary)', fontWeight: 600 }}>respondan a tus clientes automáticamente</span>.
          </>
        ) : (
          <>
            If you already have a website, we improve it. If you don't, we create it. We help you be found on Google.
            And we also activate WhatsApp and AI assistants to <span style={{ color: 'var(--primary)', fontWeight: 600 }}>answer your customers automatically</span>.
          </>
        )}
      </p>

      <form className="prompt-box" onSubmit={submit} style={{ marginBottom: '4rem' }}>
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

      {/* Feature List Block */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 5rem', width: '100%' }}>
        <FeatureList locale={locale} />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <section className="card landing-section">
          <h2>{locale === "es" ? "ADN de Modernización" : "Modernization DNA"}</h2>
          <div className="dna-grid">
            {businessWins.map((item) => (
              <div key={item.text} className={`dna-card ${item.color}`}>
                <div className="dna-icon">{item.icon}</div>
                <div className="dna-text">{item.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card landing-section">
          <h2>{locale === "es" ? "De Web Antigua a Web con IA" : "From Legacy Web to AI Powered"}</h2>
          <ol className="step-list">
            <li>
              <div>
                <strong>{locale === "es" ? "Diagnóstico de Valor" : "Value Diagnosis"}</strong>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>{locale === "es" ? "Detectamos dónde tu tecnología actual te está haciendo perder dinero." : "We identify where your current tech is making you lose money."}</p>
              </div>
            </li>
            <li>
              <div>
                <strong>{locale === "es" ? "Transformación Digital" : "Digital Transformation"}</strong>
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
          <div className="why-grid">
            {whyModernize.map((item) => (
              <div key={item.text} className={`why-card ${item.color}`}>
                <div className="why-icon">{item.icon}</div>
                <div className="why-text">{item.text}</div>
              </div>
            ))}
          </div>
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
              <a
                href={locale === "es"
                  ? "https://wa.me/5491165689145?text=Hola%20RiWeb%2C%20vengo%20desde%20la%20web%20y%20me%20gustar%C2%ADa%20agendar%20una%20sesi%C3%B3n%20de%20IA%20para%20mi%20negocio."
                  : "https://wa.me/5491165689145?text=Hello%20RiWeb%2C%20I'm%20coming%20from%20the%20website%20and%20would%20like%20to%20schedule%20an%20AI%20session%20for%20my%20business."
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-white"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {locale === "es" ? "📞 Agendar Sesión IA" : "📞 Schedule AI Session"}
              </a>
              <button
                type="button"
                className="btn-outline-white"
                onClick={() => document.getElementById('url-input')?.focus()}
              >
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

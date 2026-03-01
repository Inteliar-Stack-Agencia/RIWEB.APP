import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";

export default function HomePage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/audit?url=${encodeURIComponent(url)}`);
  };

  const analysisItems = locale === "es"
    ? [
        "Velocidad y performance",
        "SEO básico",
        "Experiencia mobile",
        "Conversión y captación de leads",
        "Automatización y preparación para IA",
        "Tecnología y seguridad"
      ]
    : [
        "Speed and performance",
        "Basic SEO",
        "Mobile experience",
        "Conversion and lead capture",
        "Automation and AI readiness",
        "Technology and security"
      ];

  const modernizationItems = locale === "es"
    ? [
        "Rediseño actual",
        "Optimización SEO",
        "Mejora de velocidad",
        "Implementación de chat IA",
        "Automatización de consultas y leads",
        "Infraestructura moderna",
        "Mantenimiento continuo"
      ]
    : [
        "Modern redesign",
        "SEO optimization",
        "Speed improvements",
        "AI chat implementation",
        "Inquiry and lead automation",
        "Modern infrastructure",
        "Continuous maintenance"
      ];

  return (
    <section className="landing-shell">
      <div className="landing-brand">● RIWEB.APP</div>
      <h1 className="landing-title">
        {locale === "es"
          ? "¿Tu web está perdiendo clientes sin que lo sepas?"
          : "Is your website losing clients without you noticing?"}
      </h1>
      <p className="landing-subtitle">
        {locale === "es"
          ? "Analizamos tu sitio en segundos y te mostramos cómo llevarlo a 2026."
          : "We analyze your site in seconds and show you how to bring it to 2026."}
      </p>

      <form className="prompt-box" onSubmit={submit}>
        <label htmlFor="url-input" className="prompt-label">{locale === "es" ? "Ingresá tu web para comenzar" : "Enter your website to get started"}</label>
        <div className="prompt-row">
          <input
            id="url-input"
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <button className="cta-pill" type="submit">
            {locale === "es" ? "Analizar mi web" : "Analyze my website"}
          </button>
        </div>
      </form>

      <section className="card landing-section">
        <h2>{locale === "es" ? "Qué analizamos" : "What we analyze"}</h2>
        <p className="muted section-intro">{locale === "es" ? "Detectamos:" : "We detect:"}</p>
        <ul className="service-list">
          {analysisItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="card landing-section">
        <h2>{locale === "es" ? "Qué pasa después del informe" : "What happens after the report"}</h2>
        <p className="landing-copy-block">
          {locale === "es"
            ? "Tu informe no termina en un score."
            : "Your report does not end with a score."}
        </p>
        <p className="muted section-intro">{locale === "es" ? "Recibís:" : "You get:"}</p>
        <ol className="step-list">
          <li>{locale === "es" ? "1️⃣ Diagnóstico claro" : "1️⃣ Clear diagnosis"}</li>
          <li>{locale === "es" ? "2️⃣ Roadmap de mejora" : "2️⃣ Improvement roadmap"}</li>
          <li>{locale === "es" ? "3️⃣ Propuesta de actualización personalizada" : "3️⃣ Personalized upgrade proposal"}</li>
        </ol>
        <p className="landing-copy-block strong-copy">{locale === "es" ? "Nosotros nos encargamos de todo." : "We handle everything for you."}</p>
      </section>

      <section className="card landing-section">
        <h2>{locale === "es" ? "Modernizamos tu web sin perder tu marca." : "We modernize your website without losing your brand."}</h2>
        <ul className="service-list check-list">
          {modernizationItems.map((item) => <li key={item}>✔ {item}</li>)}
        </ul>
      </section>

      <section className="card landing-section final-cta">
        <h2>{locale === "es" ? "¿Querés que tu web empiece a trabajar para vos?" : "Do you want your website to start working for you?"}</h2>
        <div className="final-cta-actions">
          <button type="button" className="cta-pill secondary-pill">
            {locale === "es" ? "Solicitar propuesta" : "Request proposal"}
          </button>
          <button type="button" className="cta-pill">
            {locale === "es" ? "Agendar llamada" : "Schedule a call"}
          </button>
        </div>
      </section>
    </section>
  );
}

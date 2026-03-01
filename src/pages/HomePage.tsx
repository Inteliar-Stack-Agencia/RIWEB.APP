import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";

export default function HomePage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const suggestions = locale === "es"
    ? [
        "Panel de reportes",
        "Plataforma de juegos",
        "Portal de bienvenida",
        "Visualizador de espacios",
        "Aplicación de Networking",
        "Portal de e-commerce",
        "Asistente de reservas",
        "Dashboard para ventas"
      ]
    : [
        "Reporting dashboard",
        "Gaming platform",
        "Onboarding portal",
        "Space visualizer",
        "Networking app",
        "E-commerce portal",
        "Booking assistant",
        "Sales dashboard"
      ];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/audit?url=${encodeURIComponent(url)}`);
  };

  return (
    <section className="landing-shell">
      <div className="landing-brand">● RIWEB.APP</div>
      <h1 className="landing-title">
        {locale === "es"
          ? "Crea apps potentes rápido.\nSin necesidad de código."
          : "Build powerful apps quickly.\nWithout writing code."}
      </h1>
      <p className="landing-subtitle">
        {locale === "es"
          ? "Tu visión, sin límites."
          : "Your vision, without limits."}
      </p>

      <form className="prompt-box" onSubmit={submit}>
        <label htmlFor="url-input" className="prompt-label">{locale === "es" ? "Crea una auditoría" : "Create an audit"}</label>
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
            {locale === "es" ? "Crear ahora →" : "Create now →"}
          </button>
        </div>
      </form>

      <p className="suggestions-title">
        {locale === "es"
          ? "¿No sabes por dónde empezar? Prueba una de estas opciones:"
          : "Not sure where to start? Try one of these options:"}
      </p>
      <div className="suggestions-grid">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            className="suggestion-chip"
            onClick={() => setUrl("https://example.com")}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

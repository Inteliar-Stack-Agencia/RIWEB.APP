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

  return (
    <section className="hero card">
      <h1>{locale === "es" ? "Auditoría Web con IA + Upgrade" : "AI Website Audit + Upgrade"}</h1>
      <p className="muted">
        {locale === "es"
          ? "Pegá la URL de tu sitio y obtené un score rápido y un plan de modernización."
          : "Paste your website URL and get an instant score and modernization plan."}
      </p>
      <form onSubmit={submit}>
        <label>URL</label>
        <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
        <button>{locale === "es" ? "Analizar sitio" : "Run audit"}</button>
      </form>
    </section>
  );
}

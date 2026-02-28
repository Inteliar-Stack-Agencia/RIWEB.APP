import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createLeadAuditReport } from "../lib/data";
import { reportFromMetrics, scoreFromUrl } from "../lib/scoring";
import type { Locale } from "../types";

export default function AuditPage({ locale }: { locale: Locale }) {
  const [params] = useSearchParams();
  const url = params.get("url") || "";
  const metrics = useMemo(() => scoreFromUrl(url), [url]);
  const reportDraft = useMemo(() => reportFromMetrics(metrics, locale), [metrics, locale]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const reportId = await createLeadAuditReport({
        email,
        url,
        locale,
        metrics,
        scoreTotal: metrics.total,
        ...reportDraft
      });
      const prefix = locale === "es" ? "/es" : "";
      navigate(`${prefix}/report/${reportId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2>{locale === "es" ? "Analizando" : "Analyzing"} {url || "..."}</h2>
        <div className="loading-step"><span /></div>
        <p className="muted">{locale === "es" ? "Score preliminar" : "Preliminary score"}</p>
        <p className="kpi">{metrics.total}/100</p>
      </div>
      <div className="card">
        <h3>{locale === "es" ? "Desbloquear reporte" : "Unlock full report"}</h3>
        <form onSubmit={submit}>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <button disabled={loading}>{loading ? "..." : (locale === "es" ? "Ver reporte completo" : "See full report")}</button>
        </form>
      </div>
    </>
  );
}

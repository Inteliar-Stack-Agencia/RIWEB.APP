import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createLeadAuditReport } from "../lib/data";
import { reportFromAuditResult } from "../lib/scoring";
import { hasSupabaseConfig, runAudit } from "../lib/supabase";
import type { AuditFunctionResult, Locale } from "../types";

const fallbackAudit = (url: string): AuditFunctionResult => ({
  ok: true,
  url,
  tech: { fallback: true },
  signals: {},
  metrics: {
    performance: 55,
    seoBasics: 50,
    mobile: 50,
    conversion: 45,
    aiReadiness: 40
  },
  scoreTotal: 49,
  issues: [
    {
      title: "Could not run live audit",
      why: "Supabase is not configured or audit endpoint failed.",
      fix: "Configure Supabase env vars and deploy the audit Edge Function.",
      impact: "high"
    }
  ],
  quickWins: [
    {
      title: "Set title + meta description + main CTA",
      how: "Ensure title/description are present and clear CTA is visible above the fold.",
      impact: "high"
    }
  ]
});

export default function AuditPage({ locale }: { locale: Locale }) {
  const [params] = useSearchParams();
  const url = params.get("url") || "";
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AuditFunctionResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState("");

  const [email, setEmail] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const analyze = async () => {
      if (!url) {
        setAnalysisError(locale === "es" ? "URL inválida." : "Invalid URL.");
        return;
      }

      setAnalysisLoading(true);
      setAnalysisError(null);
      setAnalysisStep(locale === "es" ? "Validando URL..." : "Validating URL...");

      try {
        setAnalysisStep(locale === "es" ? "Consultando sitio..." : "Fetching website...");
        const result = await runAudit(url);
        if (cancelled) return;
        setAnalysisStep(locale === "es" ? "Calculando métricas..." : "Calculating metrics...");
        setAnalysis(result);
      } catch (err) {
        console.error("Audit function failed", err);
        if (cancelled) return;

        if (!hasSupabaseConfig) {
          setAnalysis(fallbackAudit(url));
          setAnalysisError(locale === "es"
            ? "No hay conexión con Supabase configurada. Mostramos un modo temporal."
            : "Supabase is not configured. Showing temporary fallback mode.");
        } else {
          setAnalysisError(locale === "es"
            ? "No pudimos analizar tu web en este momento. Probá nuevamente."
            : "We couldn't analyze your website right now. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setAnalysisLoading(false);
          setAnalysisStep("");
        }
      }
    };

    analyze();

    return () => {
      cancelled = true;
    };
  }, [locale, url]);

  const reportDraft = useMemo(() => {
    if (!analysis) return null;
    return reportFromAuditResult(analysis, locale);
  }, [analysis, locale]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!analysis || !reportDraft) {
      setSubmitError(locale === "es" ? "Esperá a que termine el análisis." : "Wait until the analysis is complete.");
      return;
    }

    setSubmitError(null);
    setSubmitLoading(true);

    try {
      const created = await createLeadAuditReport({
        email,
        url,
        locale,
        metrics: analysis.metrics,
        scoreTotal: analysis.scoreTotal,
        tech: analysis.tech,
        ...reportDraft
      });

      const prefix = locale === "es" ? "/es" : "";
      navigate(`${prefix}/report/${created.reportId}`, {
        state: {
          report: created.report,
          audit: created.audit
        }
      });
    } catch (err) {
      console.error("Failed to create report flow", err);
      setSubmitError(locale === "es"
        ? "No pudimos generar el reporte. Intentá nuevamente en unos segundos."
        : "We couldn't generate the report. Please try again in a few seconds.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2>{locale === "es" ? "Analizando" : "Analyzing"} {url || "..."}</h2>
        {analysisLoading ? <div className="loading-step"><span /></div> : null}
        <p className="muted">{analysisLoading
          ? analysisStep
          : (locale === "es" ? "Auditoría completada" : "Audit completed")}
        </p>
        <p className="kpi">{analysis ? `${analysis.scoreTotal}/100` : "--/100"}</p>
        {analysisError ? <p className="error-text">{analysisError}</p> : null}

        {analysis ? (
          <div className="grid">
            <div><p className="muted">Performance</p><strong>{analysis.metrics.performance}</strong></div>
            <div><p className="muted">SEO</p><strong>{analysis.metrics.seoBasics}</strong></div>
            <div><p className="muted">Mobile</p><strong>{analysis.metrics.mobile}</strong></div>
            <div><p className="muted">Conversion</p><strong>{analysis.metrics.conversion}</strong></div>
            <div><p className="muted">AI Readiness</p><strong>{analysis.metrics.aiReadiness}</strong></div>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h3>{locale === "es" ? "Desbloquear reporte" : "Unlock full report"}</h3>
        <form onSubmit={submit}>
          <label>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          <button disabled={submitLoading || analysisLoading || !analysis}>
            {submitLoading ? "..." : (locale === "es" ? "Ver reporte completo" : "See full report")}
          </button>
        </form>
        {submitError ? <p className="error-text">{submitError}</p> : null}

        {analysis ? (
          <>
            <h4>{locale === "es" ? "Hallazgos" : "Findings"}</h4>
            <ul className="list">
              {analysis.issues.slice(0, 3).map((item) => <li key={item.title}>{item.title}</li>)}
            </ul>
            <h4>{locale === "es" ? "Quick wins" : "Quick wins"}</h4>
            <ul className="list">
              {analysis.quickWins.slice(0, 3).map((item) => <li key={item.title}>{item.title}</li>)}
            </ul>
          </>
        ) : null}
      </div>
    </>
  );
}

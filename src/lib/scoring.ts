import type { AuditFunctionResult, Locale } from "../types";

export function reportFromAuditResult(result: AuditFunctionResult, locale: Locale) {
  const summary = locale === "es"
    ? `Tu web obtuvo ${result.scoreTotal}/100. Detectamos oportunidades claras para mejorar visibilidad, captación y experiencia móvil.`
    : `Your website scored ${result.scoreTotal}/100. We found clear opportunities to improve visibility, lead capture, and mobile experience.`;

  const opportunities = result.quickWins.length > 0
    ? result.quickWins.map((item) => item.title)
    : (locale === "es"
      ? [
          "Optimizar la jerarquía de contenido y llamados a la acción.",
          "Mejorar SEO técnico básico (title, description, canonical).",
          "Agregar puntos de contacto directos para captación de leads."
        ]
      : [
          "Optimize content hierarchy and call-to-action placement.",
          "Improve technical SEO basics (title, description, canonical).",
          "Add direct contact points to increase lead capture."
        ]);

  const risks = result.issues.length > 0
    ? result.issues.map((item) => item.title)
    : (locale === "es"
      ? ["No se detectaron señales críticas, pero hay margen de mejora."]
      : ["No critical signals were found, but there is room for improvement."]);

  return { summary, opportunities, risks };
}

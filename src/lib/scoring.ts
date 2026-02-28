export function scoreFromUrl(url: string) {
  const isHttps = url.startsWith("https://");
  const hasBlog = /blog|news|article/.test(url);
  const hasShop = /shop|store|cart/.test(url);
  const performance = isHttps ? 78 : 52;
  const seoBasics = hasBlog ? 82 : 64;
  const mobile = 70;
  const conversion = hasShop ? 80 : 58;
  const aiReadiness = isHttps && hasBlog ? 76 : 60;
  const total = Math.round(
    performance * 0.25 + seoBasics * 0.2 + mobile * 0.15 + conversion * 0.25 + aiReadiness * 0.15
  );

  return { performance, seoBasics, mobile, conversion, aiReadiness, total };
}

export function reportFromMetrics(metrics: ReturnType<typeof scoreFromUrl>, locale: "en" | "es") {
  const opportunities = locale === "es"
    ? [
        "Mejorar velocidad con compresión de imágenes y limpieza de scripts.",
        "Agregar mejores bases SEO (meta description y jerarquía H1).",
        "Clarificar CTA e incluir señales de confianza arriba del primer scroll.",
        "Agregar FAQ orientada a IA y schema markup."
      ]
    : [
        "Improve speed with image compression and script cleanup.",
        "Add stronger SEO basics (meta description and H1 hierarchy).",
        "Clarify CTA and include trust signals above the fold.",
        "Add AI-ready FAQ and schema markup."
      ];

  const risks = locale === "es"
    ? ["Mensajes de valor poco visibles.", "Estructura SEO inconsistente."]
    : ["Value proposition is not immediately clear.", "SEO structure appears inconsistent."];

  const summary = locale === "es"
    ? `Tu score es ${metrics.total}/100. Hay potencial claro para mejorar conversión y posicionamiento.`
    : `Your website scored ${metrics.total}/100. There is clear upside in conversion and visibility.`;

  return { summary, opportunities, risks };
}

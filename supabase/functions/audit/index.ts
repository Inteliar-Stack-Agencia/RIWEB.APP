interface AuditIssue {
  title: string;
  why: string;
  fix: string;
  impact: "low" | "medium" | "high";
}

interface AuditQuickWin {
  title: string;
  how: string;
  impact: "low" | "medium" | "high";
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
    }
  });

const privateHostPatterns = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^::1$/,
  /^fc/i,
  /^fd/i
];

function isPublicHttpUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  const host = parsed.hostname.toLowerCase();
  if (privateHostPatterns.some((pattern) => pattern.test(host))) return false;
  if (host.endsWith(".local") || host.endsWith(".internal")) return false;
  return true;
}

function hasMatch(html: string, regex: RegExp): boolean {
  return regex.test(html);
}

function score(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function getPageSpeedMetrics(url: string, key?: string) {
  if (!key) return null;
  try {
    const apiReq = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${key}&category=PERFORMANCE&category=ACCESSIBILITY&category=SEO&category=BEST_PRACTICES&strategy=mobile`);
    const data = await apiReq.json();
    const l = data.lighthouseResult.categories;
    return {
      performance: Math.round(l.performance.score * 100),
      accessibility: Math.round(l.accessibility.score * 100),
      seo: Math.round(l.seo.score * 100),
      bestPractices: Math.round(l['best-practices'].score * 100),
    };
  } catch (err) {
    console.error("PageSpeed API failed", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  try {
    const body = await req.json().catch(() => null) as { url?: string } | null;
    const url = body?.url?.trim();

    if (!url || !isPublicHttpUrl(url)) {
      return json(400, { ok: false, error: "Invalid URL. Only public http/https URLs are allowed." });
    }

    const GOOGLE_PAGESPEED_API_KEY = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
    const psMetrics = await getPageSpeedMetrics(url, GOOGLE_PAGESPEED_API_KEY);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "RiWebAuditBot/1.0 (+https://riweb.app)"
        },
        redirect: "follow",
        signal: controller.signal
      });
    } catch (err) {
      return json(502, { ok: false, error: `Fetch failed: ${err instanceof Error ? err.message : "Unknown"}` });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return json(502, { ok: false, error: `Target returned status ${response.status}` });
    }

    const html = await response.text();
    const head = response.headers;
    const normalized = html.toLowerCase();
    const isSpanish = normalized.includes("lang=\"es\"") || normalized.includes("lang='es'");

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]?.trim() || "";
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() || "";
    const hasViewport = hasMatch(normalized, /<meta[^>]+name=["']viewport["']/i);
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]?.trim() || "";
    const robots = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]?.trim() || "";
    const usesHttps = url.startsWith("https://");

    // Security Headers Analysis
    const secHeaders = {
      hsts: !!head.get("strict-transport-security"),
      csp: !!head.get("content-security-policy"),
      xfo: !!head.get("x-frame-options"),
      xcto: !!head.get("x-content-type-options"),
    };

    const analytics = {
      gtag: hasMatch(normalized, /gtag\(/),
      ga: hasMatch(normalized, /google-analytics|analytics\.js|gtm\.js|googletagmanager/),
      fbq: hasMatch(normalized, /fbq\(/),
      hotjar: hasMatch(normalized, /hotjar/),
      clarity: hasMatch(normalized, /clarity\.ms/)
    };

    const tech = {
      wordpress: hasMatch(normalized, /wp-content|wordpress/),
      elementor: hasMatch(normalized, /elementor/),
      shopify: hasMatch(normalized, /cdn\.shopify|shopify/),
      wix: hasMatch(normalized, /wix\.com|_wix/),
      webflow: hasMatch(normalized, /webflow/),
      squarespace: hasMatch(normalized, /squarespace/),
      react: hasMatch(normalized, /data-reactroot|react/),
      next: hasMatch(normalized, /__next|_next\//),
      framer: hasMatch(normalized, /framer\.com|framer-site/),
      hubspot: hasMatch(normalized, /hs-script-loader|hubspot/)
    };

    const scriptCount = (html.match(/<script\b/gi) || []).length;
    const htmlSizeKb = Math.round((new TextEncoder().encode(html).length / 1024) * 10) / 10;
    const hasContact = hasMatch(normalized, /contact|contacto|get in touch|book a call/);
    const hasForm = hasMatch(normalized, /<form\b/);
    const hasCta = hasMatch(normalized, /request|solicitar|demo|quote|proposal|agendar|book now|start now|contact us|contactar/);
    const hasWhatsapp = hasMatch(normalized, /wa\.me|whatsapp/);
    const hasChat = hasMatch(normalized, /intercom|drift|zendesk|tawk\.to|chatwoot|livechat|crisp/);
    const hasFaq = hasMatch(normalized, /faq|preguntas frecuentes/);
    const hasAutomationHints = hasMatch(normalized, /automation|automati[sz]aci[oó]n|bot|ai|ia|agente/);
    const hasSocialLinks = hasMatch(normalized, /instagram\.com|facebook\.com|twitter\.com|x\.com\/[^/]|tiktok\.com|linkedin\.com|youtube\.com/);

    const seoSignals = {
      title: Boolean(title),
      metaDescription: Boolean(metaDescription),
      h1: Boolean(h1),
      viewport: hasViewport,
      canonical: Boolean(canonical),
      robots: Boolean(robots),
      https: usesHttps,
      analytics,
      scriptCount,
      htmlSizeKb,
      hasContact,
      hasForm,
      hasCta,
      hasWhatsapp,
      hasChat,
      hasFaq,
      hasAutomationHints
    };

    // 1. PERFORMANCE
    let performance = psMetrics?.performance ?? 85;
    if (!psMetrics) {
      if (htmlSizeKb > 500) performance -= 30;
      else if (htmlSizeKb > 250) performance -= 20;
      if (scriptCount > 40) performance -= 20;
    }
    performance = score(performance);

    // 2. SPEED (LCP ESTIMATE)
    let speed = psMetrics?.performance ? Math.min(psMetrics.performance + 5, 100) : score(performance - 10);
    if (!usesHttps) speed -= 10;
    speed = score(speed);

    // 3. SEO
    const seoBasics = psMetrics?.seo ?? score(
      (seoSignals.title ? 20 : 0) +
      (seoSignals.metaDescription ? 20 : 0) +
      (seoSignals.h1 ? 20 : 0) +
      (seoSignals.canonical ? 20 : 0) +
      (seoSignals.robots ? 20 : 0)
    );

    // 4. MOBILE
    const mobile = score(hasViewport ? 92 : 35);

    // 5. CONVERSION
    const conversion = score(
      (hasCta ? 35 : 0) +
      (hasContact ? 25 : 0) +
      (hasForm ? 25 : 0) +
      (hasWhatsapp ? 15 : 0)
    );

    // 6. AI READINESS
    const aiReadiness = score(
      (hasChat ? 35 : 0) +
      (hasWhatsapp ? 25 : 0) +
      (hasAutomationHints ? 40 : 0)
    );

    // 7. SECURITY
    const security = score(
      (usesHttps ? 40 : 0) +
      (secHeaders.hsts ? 20 : 0) +
      (secHeaders.csp ? 20 : 0) +
      (secHeaders.xfo ? 10 : 0) +
      (secHeaders.xcto ? 10 : 0)
    );

    // 8. ACCESSIBILITY
    const accessibility = psMetrics?.accessibility ?? score(
      (hasViewport ? 50 : 20) + (hasFaq ? 20 : 0) + 20 // baseline
    );

    // 9. WHATSAPP / BOT
    const whatsappBot = score(
      (hasWhatsapp ? 80 : 0) +
      (hasChat ? 20 : 0)
    );

    // 10. SOCIAL PRESENCE
    const socialPresence = score(
      (hasSocialLinks ? 70 : 0) +
      (analytics.ga || analytics.fbq ? 30 : 0)
    );

    const metrics = {
      performance,
      speed,
      seoBasics,
      mobile,
      conversion,
      aiReadiness,
      security,
      accessibility,
      whatsappBot,
      socialPresence
    };

    const scoreTotal = score(
      performance * 0.13 +
      speed * 0.13 +
      seoBasics * 0.13 +
      mobile * 0.12 +
      conversion * 0.13 +
      aiReadiness * 0.10 +
      security * 0.10 +
      accessibility * 0.05 +
      whatsappBot * 0.08 +
      socialPresence * 0.03
    );

    const issues: AuditIssue[] = [];
    const quickWins: AuditQuickWin[] = [];

    if (!usesHttps) {
      issues.push({
        title: isSpanish ? "Conexión no segura (HTTP)" : "Insecure Connection (HTTP)",
        why: isSpanish ? "HTTP no cifra los datos, afectando confianza y SEO." : "HTTP doesn't encrypt data, hurting trust and SEO rankings.",
        fix: isSpanish ? "Instalar un certificado SSL y forzar HTTPS." : "Install an SSL certificate and enforce HTTPS.",
        impact: "high"
      });
    }
    if (!secHeaders.csp || !secHeaders.hsts) {
      issues.push({
        title: isSpanish ? "Políticas de seguridad ausentes" : "Security policies missing",
        why: isSpanish ? "Faltan headers como CSP o HSTS que protegen contra ataques." : "Missing security headers like CSP or HSTS protects against common attacks.",
        fix: isSpanish ? "Configurar headers de seguridad en el servidor." : "Configure security headers on your server.",
        impact: "medium"
      });
    }

    if (!seoSignals.title) {
      issues.push({
        title: isSpanish ? "Falta etiqueta <title>" : "Missing <title>",
        why: isSpanish ? "Los motores de búsqueda y usuarios necesitan un título claro." : "Search engines and users need a clear title to understand the page.",
        fix: isSpanish ? "Añadí un <title> único y enfocado en palabras clave." : "Add a unique, keyword-focused <title> for each important page.",
        impact: "high"
      });
    }

    if (!hasForm && !hasWhatsapp) {
      issues.push({
        title: isSpanish ? "Captura de leads débil" : "Weak lead capture",
        why: isSpanish ? "Sin formulario o chat directo se pierden oportunidades." : "No form or direct chat channel reduces conversion chances.",
        fix: isSpanish ? "Añadí un formulario corto o botón de WhatsApp visible." : "Add a short contact form or WhatsApp entry point above the fold.",
        impact: "high"
      });
    }

    if (!hasCta) {
      quickWins.push({
        title: isSpanish ? "Añadir CTA principal" : "Add a clear primary CTA",
        how: isSpanish ? "Incluí un botón de acción visible (solicitar/agendar)." : "Include one visible action button in the hero (quote/call/proposal).",
        impact: "high"
      });
    }
    if (!hasChat && !hasAutomationHints) {
      quickWins.push({
        title: isSpanish ? "Automatizar atención al cliente" : "Automate Customer Support",
        how: isSpanish ? "Integrar un agente de IA para responder dudas 24/7." : "Integrate an AI Agent to answer queries 24/7.",
        impact: "high"
      });
    }

    return json(200, {
      ok: true,
      url,
      tech,
      signals: seoSignals,
      metrics,
      scoreTotal,
      issues,
      quickWins
    });
  } catch (err) {
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : "Unexpected error"
    });
  }
});

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
    const normalized = html.toLowerCase();

    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)?.[1]?.trim() || "";
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() || "";
    const hasViewport = hasMatch(normalized, /<meta[^>]+name=["']viewport["']/i);
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]?.trim() || "";
    const robots = html.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim() || "";
    const usesHttps = url.startsWith("https://");

    const analytics = {
      gtag: hasMatch(normalized, /gtag\(/),
      ga: hasMatch(normalized, /google-analytics|analytics\.js|gtm\.js|googletagmanager/),
      fbq: hasMatch(normalized, /fbq\(/)
    };

    const tech = {
      wordpress: hasMatch(normalized, /wp-content|wordpress/),
      shopify: hasMatch(normalized, /cdn\.shopify|shopify/),
      wix: hasMatch(normalized, /wix\.com|_wix/),
      webflow: hasMatch(normalized, /webflow/),
      squarespace: hasMatch(normalized, /squarespace/),
      react: hasMatch(normalized, /data-reactroot|react/),
      next: hasMatch(normalized, /__next|_next\//)
    };

    const scriptCount = (html.match(/<script\b/gi) || []).length;
    const htmlSizeKb = Math.round((new TextEncoder().encode(html).length / 1024) * 10) / 10;
    const hasContact = hasMatch(normalized, /contact|contacto|get in touch|book a call/);
    const hasForm = hasMatch(normalized, /<form\b/);
    const hasCta = hasMatch(normalized, /request|solicitar|demo|quote|proposal|agendar|book now|start now|contact us/);
    const hasWhatsapp = hasMatch(normalized, /wa\.me|whatsapp/);
    const hasChat = hasMatch(normalized, /intercom|drift|zendesk|tawk\.to|chatwoot|livechat|crisp/);
    const hasFaq = hasMatch(normalized, /faq|preguntas frecuentes/);
    const hasAutomationHints = hasMatch(normalized, /automation|automati[sz]aci[oó]n|bot|ai|ia/);

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

    const seoBasics = score(
      (seoSignals.title ? 20 : 0) +
      (seoSignals.metaDescription ? 20 : 0) +
      (seoSignals.h1 ? 20 : 0) +
      (seoSignals.canonical ? 20 : 0) +
      (seoSignals.robots ? 20 : 0)
    );

    const mobile = score(hasViewport ? 90 : 35);

    const conversion = score(
      (hasCta ? 35 : 0) +
      (hasContact ? 25 : 0) +
      (hasForm ? 25 : 0) +
      (hasWhatsapp ? 15 : 0)
    );

    const aiReadiness = score(
      (hasChat ? 35 : 0) +
      (hasWhatsapp ? 25 : 0) +
      (hasFaq ? 20 : 0) +
      (hasAutomationHints ? 20 : 0)
    );

    let performance = 85;
    if (htmlSizeKb > 500) performance -= 30;
    else if (htmlSizeKb > 250) performance -= 20;
    else if (htmlSizeKb > 120) performance -= 10;

    if (scriptCount > 40) performance -= 30;
    else if (scriptCount > 25) performance -= 20;
    else if (scriptCount > 12) performance -= 10;

    if (!usesHttps) performance -= 15;

    performance = score(performance);

    const scoreTotal = score(
      performance * 0.28 + seoBasics * 0.24 + mobile * 0.16 + conversion * 0.2 + aiReadiness * 0.12
    );

    const issues: AuditIssue[] = [];
    const quickWins: AuditQuickWin[] = [];

    if (!seoSignals.title) {
      issues.push({
        title: "Missing <title>",
        why: "Search engines and users need a clear title to understand the page.",
        fix: "Add a unique, keyword-focused <title> for each important page.",
        impact: "high"
      });
    }
    if (!seoSignals.metaDescription) {
      issues.push({
        title: "Missing meta description",
        why: "Without it, search snippets are weaker and CTR can drop.",
        fix: "Add a compelling 140–160 char description with value proposition.",
        impact: "medium"
      });
    }
    if (!seoSignals.h1) {
      issues.push({
        title: "No H1 heading detected",
        why: "H1 helps users and crawlers understand page hierarchy.",
        fix: "Add one clear H1 aligned with the main offer.",
        impact: "medium"
      });
    }
    if (!hasViewport) {
      issues.push({
        title: "Missing viewport meta",
        why: "Mobile rendering may be broken and hurt UX/conversion.",
        fix: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
        impact: "high"
      });
    }
    if (!hasForm && !hasWhatsapp) {
      issues.push({
        title: "Weak lead capture",
        why: "No form or direct chat channel reduces conversion chances.",
        fix: "Add a short contact form or WhatsApp entry point above the fold.",
        impact: "high"
      });
    }

    if (scriptCount > 25) {
      quickWins.push({
        title: "Reduce script weight",
        how: "Remove unused third-party scripts and defer non-critical JS.",
        impact: "high"
      });
    }
    if (!hasCta) {
      quickWins.push({
        title: "Add a clear primary CTA",
        how: "Include one visible action button in the hero (quote/call/proposal).",
        impact: "high"
      });
    }
    if (!hasChat && !hasWhatsapp) {
      quickWins.push({
        title: "Add conversational channel",
        how: "Enable website chat or WhatsApp for faster qualification.",
        impact: "medium"
      });
    }

    if (quickWins.length === 0) {
      quickWins.push({
        title: "Strengthen trust signals",
        how: "Add testimonials, logos, and response-time promises near CTA.",
        impact: "medium"
      });
    }

    return json(200, {
      ok: true,
      url,
      tech,
      signals: {
        title,
        metaDescription,
        h1,
        viewport: hasViewport,
        canonical,
        robots,
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
      },
      metrics: {
        seoBasics,
        mobile,
        conversion,
        aiReadiness,
        performance
      },
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

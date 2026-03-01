const app = document.getElementById("app");
const langToggle = document.getElementById("lang-toggle");

const i18n = {
  en: {
    homeTitle: "AI Website Audit + Upgrade",
    homeBody: "Paste your website URL and get an instant score, practical recommendations, and a modernization plan.",
    cta: "Run audit",
    emailGate: "Unlock full report",
    adminHint: "Admin console",
  },
  es: {
    homeTitle: "Auditoría Web con IA + Upgrade",
    homeBody: "Pegá la URL de tu sitio y obtené un score rápido, recomendaciones prácticas y un plan de modernización.",
    cta: "Analizar sitio",
    emailGate: "Desbloquear reporte completo",
    adminHint: "Consola admin",
  },
};

const state = {
  locale: location.pathname.startsWith("/es") ? "es" : "en",
  draftAudit: null,
};

const getData = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const saveData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const uid = () => crypto.randomUUID();

function normalizeRoute(pathname) {
  const raw = pathname.replace(/\/$/, "") || "/";
  const es = raw.startsWith("/es");
  const stripped = es ? raw.slice(3) || "/" : raw;
  return { locale: es ? "es" : "en", path: stripped };
}

function scoreFromUrl(url) {
  const isHttps = url.startsWith("https://");
  const hasBlog = /blog|news|article/.test(url);
  const hasShop = /shop|store|cart/.test(url);
  const performance = isHttps ? 78 : 52;
  const seoBasics = hasBlog ? 82 : 64;
  const mobile = 70;
  const conversion = hasShop ? 80 : 58;
  const aiReadiness = isHttps && hasBlog ? 76 : 60;
  const total = Math.round(performance*0.25 + seoBasics*0.2 + mobile*0.15 + conversion*0.25 + aiReadiness*0.15);
  return { performance, seoBasics, mobile, conversion, aiReadiness, total };
}

function reportFromMetrics(metrics, locale) {
  const oppEn = [];
  const oppEs = [];
  if (metrics.performance < 70) { oppEn.push("Improve speed with image compression and script cleanup."); oppEs.push("Mejorar velocidad con compresión de imágenes y limpieza de scripts."); }
  if (metrics.seoBasics < 70) { oppEn.push("Add stronger SEO basics (meta description, H1 hierarchy, structured content)."); oppEs.push("Agregar mejores bases SEO (meta description, jerarquía H1 y contenido estructurado)."); }
  if (metrics.conversion < 70) { oppEn.push("Clarify CTA and include trust signals above the fold."); oppEs.push("Clarificar CTA e incluir señales de confianza arriba del primer scroll."); }
  oppEn.push("Add AI-ready FAQ and schema markup for better discoverability.");
  oppEs.push("Agregar FAQ orientada a IA y schema markup para mejor descubribilidad.");

  return {
    summary: locale === "es"
      ? `Tu score es ${metrics.total}/100. Hay potencial claro para mejorar conversión y posicionamiento.`
      : `Your website scored ${metrics.total}/100. There is clear upside in conversion and visibility.`,
    opportunities: locale === "es" ? oppEs : oppEn,
    risks: locale === "es"
      ? ["Mensajes de valor poco visibles.", "Estructura SEO inconsistente."]
      : ["Value proposition is not immediately clear.", "SEO structure appears inconsistent."],
  };
}

function navigate(path) {
  history.pushState({}, "", path);
  render();
}

document.body.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (!link) return;
  e.preventDefault();
  navigate(link.getAttribute("href"));
});

window.addEventListener("popstate", render);
langToggle.addEventListener("click", () => {
  const current = normalizeRoute(location.pathname);
  const target = current.locale === "en" ? "es" : "en";
  const path = target === "es" ? `/es${current.path === "/" ? "" : current.path}` : current.path;
  navigate(path);
});

function home(locale) {
  const t = i18n[locale];
  app.innerHTML = `<section class="hero card">
    <h1>${t.homeTitle}</h1>
    <p class="muted">${t.homeBody}</p>
    <form id="audit-form">
      <label>URL</label>
      <input required type="url" name="url" placeholder="https://example.com" />
      <button>${t.cta}</button>
    </form>
  </section>`;

  document.getElementById("audit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const url = new FormData(e.target).get("url");
    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/audit?url=${encodeURIComponent(url)}`);
  });
}

function audit(locale) {
  const params = new URLSearchParams(location.search);
  const url = params.get("url") || "";
  const m = scoreFromUrl(url);
  state.draftAudit = { url, metrics: m };

  app.innerHTML = `<div class="card">
    <h2>${locale === "es" ? "Analizando" : "Analyzing"} ${url}</h2>
    <div class="loading-step"><span></span></div>
    <p class="muted">${locale === "es" ? "Score preliminar" : "Preliminary score"}</p>
    <p class="kpi">${m.total}/100</p>
  </div>
  <div class="card">
    <h3>${locale === "es" ? "Desbloquear reporte" : "Unlock full report"}</h3>
    <form id="lead-form">
      <label>Email</label>
      <input required name="email" type="email" placeholder="you@company.com" />
      <button>${locale === "es" ? "Ver reporte completo" : "See full report"}</button>
    </form>
  </div>`;

  document.getElementById("lead-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = new FormData(e.target).get("email");
    const leadId = uid();
    const auditId = uid();
    const reportId = uid();
    const leads = getData("leads");
    const audits = getData("audits");
    const reports = getData("reports");

    leads.push({ id: leadId, email, url, locale, status: "new", notes: "", created_at: new Date().toISOString() });
    audits.push({ id: auditId, lead_id: leadId, url, metrics: m, score_total: m.total, fetched_at: new Date().toISOString() });
    reports.push({ id: reportId, lead_id: leadId, audit_id: auditId, locale, ...reportFromMetrics(m, locale), created_at: new Date().toISOString() });
    saveData("leads", leads);
    saveData("audits", audits);
    saveData("reports", reports);

    const prefix = locale === "es" ? "/es" : "";
    navigate(`${prefix}/report/${reportId}`);
  });
}

function report(locale, id) {
  const reports = getData("reports");
  const audits = getData("audits");
  const report = reports.find((r) => r.id === id);
  if (!report) {
    app.innerHTML = `<div class="card"><h2>Report not found</h2></div>`;
    return;
  }
  const audit = audits.find((a) => a.id === report.audit_id);
  const m = audit.metrics;
  app.innerHTML = `<div class="card">
    <span class="badge">${locale.toUpperCase()}</span>
    <h2>${locale === "es" ? "Reporte de auditoría" : "Audit report"}</h2>
    <p>${report.summary}</p>
    <p class="kpi">${audit.score_total}/100</p>
    <div class="grid">
      <div><p class="muted">Performance</p><strong>${m.performance}</strong></div>
      <div><p class="muted">SEO</p><strong>${m.seoBasics}</strong></div>
      <div><p class="muted">Mobile</p><strong>${m.mobile}</strong></div>
      <div><p class="muted">Conversion</p><strong>${m.conversion}</strong></div>
      <div><p class="muted">AI Readiness</p><strong>${m.aiReadiness}</strong></div>
    </div>
  </div>
  <div class="card">
    <h3>${locale === "es" ? "Oportunidades" : "Opportunities"}</h3>
    <ul class="list">${report.opportunities.map((o) => `<li>${o}</li>`).join("")}</ul>
    <h3>${locale === "es" ? "Riesgos" : "Risks"}</h3>
    <ul class="list">${report.risks.map((r) => `<li>${r}</li>`).join("")}</ul>
    <button>${locale === "es" ? "Modernizar mi web" : "Upgrade my website"}</button>
  </div>`;
}

function adminLogin() {
  app.innerHTML = `<div class="card"><h2>Admin login</h2><form id="admin-login"><label>Email</label><input required type="email" name="email"/><label>Password</label><input required type="password" name="password"/><button>Login</button></form></div>`;
  document.getElementById("admin-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    if ((data.get("email") || "").toString().includes("@")) {
      sessionStorage.setItem("admin", "ok");
      navigate("/admin");
    }
  });
}

function guardAdmin() {
  if (sessionStorage.getItem("admin") !== "ok") {
    navigate("/admin/login");
    return false;
  }
  return true;
}

function adminDashboard() {
  if (!guardAdmin()) return;
  const leads = getData("leads");
  app.innerHTML = `<div class="card"><h2>Admin dashboard</h2><p>Total leads</p><p class="kpi">${leads.length}</p><a class="link" data-link href="/admin/leads">Open leads table</a></div>`;
}

function adminLeads() {
  if (!guardAdmin()) return;
  const leads = getData("leads");
  app.innerHTML = `<div class="card"><h2>Leads</h2><table class="table"><thead><tr><th>Email</th><th>URL</th><th>Status</th><th></th></tr></thead><tbody>${leads.map(l=>`<tr><td>${l.email}</td><td>${l.url}</td><td>${l.status}</td><td><a class="link" data-link href="/admin/leads/${l.id}">View</a></td></tr>`).join("")}</tbody></table></div>`;
}

function adminLeadDetail(id) {
  if (!guardAdmin()) return;
  const leads = getData("leads");
  const audits = getData("audits");
  const reports = getData("reports");
  const lead = leads.find((l) => l.id === id);
  if (!lead) { app.innerHTML = `<div class="card">Lead not found</div>`; return; }
  const audit = audits.find((a) => a.lead_id === id);
  const report = reports.find((r) => r.lead_id === id);

  app.innerHTML = `<div class="card"><h2>${lead.email}</h2><p>${lead.url}</p><form id="status-form"><label>Status</label><select name="status"><option ${lead.status==='new'?'selected':''}>new</option><option ${lead.status==='contacted'?'selected':''}>contacted</option><option ${lead.status==='won'?'selected':''}>won</option><option ${lead.status==='lost'?'selected':''}>lost</option></select><label>Notes</label><textarea name="notes">${lead.notes || ""}</textarea><div class="row"><button>Save</button><button type="button" id="resend">Resend report (UI)</button></div></form></div>
  <div class="card"><h3>Audit</h3><pre>${JSON.stringify(audit?.metrics || {}, null, 2)}</pre><h3>Report summary</h3><p>${report?.summary || "-"}</p></div>`;

  document.getElementById("status-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    lead.status = fd.get("status");
    lead.notes = fd.get("notes");
    saveData("leads", leads);
    alert("Saved");
  });

  document.getElementById("resend").addEventListener("click", () => alert("Report resend queued (UI only)."));
}

function render() {
  const { locale, path } = normalizeRoute(location.pathname);
  state.locale = locale;
  langToggle.textContent = locale === "en" ? "ES" : "EN";

  if (path === "/") return home(locale);
  if (path === "/audit") return audit(locale);
  if (path.startsWith("/report/")) return report(locale, path.split("/")[2]);

  if (path === "/admin/login") return adminLogin();
  if (path === "/admin") return adminDashboard();
  if (path === "/admin/leads") return adminLeads();
  if (path.startsWith("/admin/leads/")) return adminLeadDetail(path.split("/")[3]);

  app.innerHTML = `<div class="card"><h2>404</h2></div>`;
}

render();

import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isEs = location.pathname.startsWith("/es");
  const normalized = isEs ? location.pathname.replace(/^\/es/, "") || "/" : location.pathname;
  const toggleTarget = isEs ? normalized : `/es${normalized === "/" ? "" : normalized}`;

  const isHome = normalized === "/";
  const isAudit = normalized.startsWith("/audit");

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    color: active ? "#F59E0B" : "var(--text-muted)",
    fontWeight: active ? 700 : 500,
    borderBottom: active ? "2px solid #F59E0B" : "2px solid transparent",
    paddingBottom: "2px",
    transition: "color 0.2s ease, border-color 0.2s ease",
    textDecoration: "none",
  });

  return (
    <>
      <header className="topbar">
        <Link to="/" className="logo" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="/logo.svg" alt="RIWEB logo" style={{ height: "32px", width: "32px" }} />
          RIWEB.APP
        </Link>
        <nav>
          <Link to={isEs ? "/es" : "/"} style={navLinkStyle(isHome)}>Home</Link>
          <Link to={isEs ? "/es/audit" : "/audit"} style={navLinkStyle(isAudit)}>Audit</Link>
          <Link className="ghost-btn" to={toggleTarget}>{isEs ? "EN" : "ES"}</Link>
        </nav>
      </header>
      <main id="app">{children}</main>
      <footer
        style={{
          textAlign: "center",
          padding: "2.5rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.3)",
          fontSize: "0.82rem",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
            RIWEB.APP
          </div>
          <div style={{ fontSize: "0.78rem", color: "rgba(245,158,11,0.65)", marginTop: "0.2rem" }}>
            Web + Bot IA
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <Link
            to={isEs ? "/es/privacidad" : "/privacy"}
            style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            {isEs ? "Política de privacidad" : "Privacy policy"}
          </Link>
          <span style={{ opacity: 0.2 }}>·</span>
          <Link
            to={isEs ? "/es/terminos" : "/terms"}
            style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            {isEs ? "Términos de servicio" : "Terms of service"}
          </Link>
        </div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>
          {isEs
            ? `RIWEB APP · Producto desarrollado por © Inteliar Stack ${new Date().getFullYear()}`
            : `RIWEB APP · Product developed by © Inteliar Stack ${new Date().getFullYear()}`}
        </div>
      </footer>
    </>
  );
}

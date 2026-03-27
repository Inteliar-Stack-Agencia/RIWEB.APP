import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isEs = location.pathname.startsWith("/es");
  const normalized = isEs ? location.pathname.replace(/^\/es/, "") || "/" : location.pathname;
  const toggleTarget = isEs ? normalized : `/es${normalized === "/" ? "" : normalized}`;

  const isHome = normalized === "/";
  const isAudit = normalized.startsWith("/audit");

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    color: active ? '#F59E0B' : 'var(--text-muted)',
    fontWeight: active ? 700 : 500,
    borderBottom: active ? '2px solid #F59E0B' : '2px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s ease, border-color 0.2s ease',
    textDecoration: 'none',
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
      <footer style={{
        textAlign: "center",
        padding: "2rem 1rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.3)",
        fontSize: "0.82rem",
      }}>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", marginBottom: "0.35rem", letterSpacing: "0.04em" }}>
          RIWEB.APP <span style={{ color: "rgba(245,158,11,0.7)", fontWeight: 400 }}>| Web + Bot IA</span>
        </div>
        <div>© {new Date().getFullYear()} Interliar Stack · {isEs ? "Todos los derechos reservados" : "All rights reserved"}</div>
      </footer>
    </>
  );
}

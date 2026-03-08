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
        <Link to="/" className="logo">RIWEB.APP</Link>
        <nav>
          <Link to={isEs ? "/es" : "/"} style={navLinkStyle(isHome)}>Home</Link>
          <Link to={isEs ? "/es/audit" : "/audit"} style={navLinkStyle(isAudit)}>Audit</Link>
          <Link className="ghost-btn" to={toggleTarget}>{isEs ? "EN" : "ES"}</Link>
        </nav>
      </header>
      <main id="app">{children}</main>
    </>
  );
}

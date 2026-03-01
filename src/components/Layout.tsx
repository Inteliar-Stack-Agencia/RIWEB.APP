import { Link, useLocation } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isEs = location.pathname.startsWith("/es");
  const normalized = isEs ? location.pathname.replace(/^\/es/, "") || "/" : location.pathname;
  const toggleTarget = isEs ? normalized : `/es${normalized === "/" ? "" : normalized}`;

  return (
    <>
      <header className="topbar">
        <Link to="/" className="logo">RIWEB.APP</Link>
        <nav>
          <Link to={isEs ? "/es" : "/"}>Home</Link>
          <Link to={isEs ? "/es/audit" : "/audit"}>Audit</Link>
          <Link to="/admin">Admin</Link>
          <Link className="ghost-btn" to={toggleTarget}>{isEs ? "EN" : "ES"}</Link>
        </nav>
      </header>
      <main id="app">{children}</main>
    </>
  );
}

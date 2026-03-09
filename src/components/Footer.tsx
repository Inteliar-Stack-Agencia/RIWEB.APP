import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isEs = location.pathname.startsWith("/es");

  return (
    <footer className="footer-premium">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logo-new.png" alt="Logo" className="footer-logo" />
            <span className="footer-brand-name">RIWEB.APP</span>
          </div>
          <nav className="footer-nav">
            <Link to={isEs ? "/es" : "/"}>{isEs ? "Inicio" : "Home"}</Link>
            <Link to={isEs ? "/es/audit" : "/audit"}>{isEs ? "Auditoría" : "Audit"}</Link>
            <a href="https://inteliar.com" target="_blank" rel="noopener noreferrer">Inteliar</a>
          </nav>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-credits">
            <p>
              {isEs ? "desarrolla por " : "developed by "}
              <a href="https://inteliar.com" target="_blank" rel="noopener noreferrer" className="highlight">
                Inteliar Stack Agencia
              </a>
              <span className="year">2026</span>
            </p>
          </div>
          <div className="footer-legal">
            <Link to="#">{isEs ? "Privacidad" : "Privacy"}</Link>
            <Link to="#">{isEs ? "Términos" : "Terms"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        {/* Brand con logo original */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <img
              src="/logo.svg"
              alt="RIWEB logo"
              style={{ height: "44px", width: "44px" }}
            />
            <span style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#F59E0B",
              fontFamily: "inherit",
            }}>
              RIWEB.APP
            </span>
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Admin</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.4rem 0 0" }}>
            Acceso interno · Interliar Stack
          </p>
        </div>

        {/* Card */}
        <div className="admin-card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@interliar.com"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {error && (
              <div style={{
                padding: "0.65rem 0.9rem",
                borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
                fontSize: "0.85rem",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", opacity: loading ? 0.7 : 1, marginTop: "0.25rem" }}
            >
              {loading ? "Iniciando sesión..." : "Ingresar"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

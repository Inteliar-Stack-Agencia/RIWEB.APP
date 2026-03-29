import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Locale } from "../types";
import { listRows, insertRow } from "../lib/supabase";

interface Bot {
  id: string;
  name: string;
  email: string;
  plan: "starter" | "pro" | "custom";
  precio_base: number;
  estado_pago: "pending" | "pagado" | "vencido";
  fecha_expiracion_soporte: string;
  mensajes_usados_este_mes: number;
  active: boolean;
  created_at: string;
}

export default function BotsPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    plan: "starter" as "starter" | "pro",
  });

  const labels = {
    en: {
      title: "My Bots",
      subtitle: "Manage your WhatsApp agents",
      createBtn: "Create New Bot",
      name: "Business Name",
      email: "Email",
      plan: "Plan",
      status: "Status",
      support: "Support Expires",
      messages: "Messages Used",
      actions: "Actions",
      starter: "Starter ($65)",
      pro: "Pro ($120)",
      pending: "Pending Payment",
      pagado: "Paid",
      vencido: "Expired",
      createTitle: "Create New Bot",
      cancelBtn: "Cancel",
      submitBtn: "Create Bot",
      noData: "No bots yet. Create your first one!",
      loading: "Loading...",
      error: "Error loading bots",
    },
    es: {
      title: "Mis Bots",
      subtitle: "Administra tus agentes de WhatsApp",
      createBtn: "Crear Nuevo Bot",
      name: "Nombre del Negocio",
      email: "Email",
      plan: "Plan",
      status: "Estado",
      support: "Soporte Expira",
      messages: "Mensajes Usados",
      actions: "Acciones",
      starter: "Starter ($65)",
      pro: "Pro ($120)",
      pending: "Pendiente de Pago",
      pagado: "Pagado",
      vencido: "Vencido",
      createTitle: "Crear Nuevo Bot",
      cancelBtn: "Cancelar",
      submitBtn: "Crear Bot",
      noData: "Sin bots aún. ¡Crea tu primer bot!",
      loading: "Cargando...",
      error: "Error cargando bots",
    },
  };

  const t = labels[locale];

  useEffect(() => {
    loadBots();
  }, []);

  async function loadBots() {
    try {
      setLoading(true);
      const data = await listRows<Bot>("clients", "select=*&order=created_at.desc");
      setBots(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      console.error("Error loading bots:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBot(e: React.FormEvent) {
    e.preventDefault();
    try {
      await insertRow("clients", {
        name: formData.name,
        email: formData.email,
        plan: formData.plan,
        precio_base: formData.plan === "pro" ? 120 : 65,
        precio_total: formData.plan === "pro" ? 120 : 65,
        estado_pago: "pending",
        fecha_contratacion: new Date().toISOString().split("T")[0],
        fecha_expiracion_soporte: new Date(Date.now() + (formData.plan === "pro" ? 180 : 90) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        active: true,
      });
      setFormData({ name: "", email: "", plan: "starter" });
      setShowForm(false);
      await loadBots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating bot");
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    return locale === "es" ? d.toLocaleDateString("es-AR") : d.toLocaleDateString("en-US");
  };

  const getPlanBadge = (plan: string) => {
    return (
      <span
        style={{
          display: "inline-block",
          background: plan === "pro" ? "rgba(202, 138, 4, 0.15)" : "rgba(139, 92, 246, 0.15)",
          color: plan === "pro" ? "#CA8A04" : "#8B5CF6",
          padding: "0.375rem 0.75rem",
          borderRadius: "999px",
          fontSize: "0.875rem",
          fontWeight: 600,
          border: plan === "pro" ? "1px solid rgba(202, 138, 4, 0.3)" : "1px solid rgba(139, 92, 246, 0.3)",
        }}
      >
        {plan === "pro" ? t.pro : t.starter}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pagado: { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" },
      pending: { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" },
      vencido: { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" },
    };
    const color = colors[status] || colors.pending;
    return (
      <span style={{ color: color.text, fontWeight: 600, fontSize: "0.875rem" }}>
        {status === "pagado" ? t.pagado : status === "pending" ? t.pending : t.vencido}
      </span>
    );
  };

  return (
    <div>
      <style>{`
        .bots-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .bots-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .bots-table thead {
          background: rgba(28, 25, 23, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .bots-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #1C1917;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bots-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #0C0A09;
          font-size: 0.95rem;
        }

        .bots-table tbody tr:hover {
          background: rgba(202, 138, 4, 0.03);
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--color-background);
          border-radius: 16px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          box-shadow: var(--shadow-xl);
        }

        .modal-content h2 {
          margin-top: 0;
          color: #1C1917;
          font-size: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #1C1917;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 200ms ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #CA8A04;
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .modal-actions button {
          flex: 1;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #44403C;
          color: #44403C;
        }

        .btn-secondary:hover {
          background: rgba(68, 64, 60, 0.05);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #44403C;
        }

        .empty-state img {
          width: 120px;
          height: 120px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .bots-table {
            font-size: 0.85rem;
          }

          .bots-table th,
          .bots-table td {
            padding: 0.75rem;
          }
        }
      `}</style>

      <div className="bots-header">
        <div>
          <h1 style={{ margin: 0, color: "#1C1917", fontSize: "2.5rem" }}>{t.title}</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#44403C", fontSize: "1rem" }}>{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#CA8A04",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t.createBtn}
        </button>
      </div>

      {error && (
        <div style={{ color: "#EF4444", padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "10px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#44403C" }}>{t.loading}</div>
      ) : bots.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <div className="empty-state">
            <p style={{ fontSize: "1.1rem", margin: 0 }}>{t.noData}</p>
          </div>
        </div>
      ) : (
        <table className="bots-table">
          <thead>
            <tr>
              <th>{t.name}</th>
              <th>{t.plan}</th>
              <th>{t.status}</th>
              <th>{t.support}</th>
              <th>{t.messages}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.id}>
                <td style={{ fontWeight: 500 }}>{bot.name}</td>
                <td>{getPlanBadge(bot.plan)}</td>
                <td>{getStatusBadge(bot.estado_pago)}</td>
                <td style={{ fontSize: "0.9rem" }}>{formatDate(bot.fecha_expiracion_soporte)}</td>
                <td>{bot.mensajes_usados_este_mes || 0}</td>
                <td>
                  <button
                    onClick={() => navigate(locale === "es" ? `/es/bots/${bot.id}` : `/bots/${bot.id}`)}
                    style={{
                      width: "auto",
                      padding: "0.375rem 0.75rem",
                      fontSize: "0.875rem",
                      borderRadius: "6px",
                      background: "#CA8A04",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {locale === "es" ? "Ver" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{t.createTitle}</h2>
            <form onSubmit={handleCreateBot}>
              <div className="form-group">
                <label>{t.name}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Electrónica García"
                  style={{ marginTop: "0.5rem" }}
                />
              </div>
              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@negocio.com"
                  style={{ marginTop: "0.5rem" }}
                />
              </div>
              <div className="form-group">
                <label>{t.plan}</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as "starter" | "pro" })}
                  style={{ marginTop: "0.5rem" }}
                >
                  <option value="starter">{t.starter}</option>
                  <option value="pro">{t.pro}</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  {t.cancelBtn}
                </button>
                <button type="submit" style={{ background: "#CA8A04", color: "white", border: "none" }}>
                  {t.submitBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

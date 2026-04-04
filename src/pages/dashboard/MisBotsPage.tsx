import { type FormEvent, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { insertRowAuth } from "../../lib/supabase";
import type { Client } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

function planBadge(plan: string | null) {
  if (!plan) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const color = plan.toLowerCase().includes("pro")
    ? { bg: "rgba(202,138,4,0.15)", border: "rgba(202,138,4,0.4)", text: "#f59e0b" }
    : { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.4)", text: "#a78bfa" };
  return (
    <span style={{
      background: color.bg, border: `1px solid ${color.border}`,
      color: color.text, borderRadius: "999px",
      fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.7rem", whiteSpace: "nowrap",
    }}>
      {plan}
    </span>
  );
}

function estadoBadge(estado: string | null) {
  if (!estado) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const lower = estado.toLowerCase();
  const color =
    lower === "activo"
      ? { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", text: "#4ade80" }
      : lower.includes("vencido")
      ? { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", text: "#f87171" }
      : { bg: "rgba(202,138,4,0.12)", border: "rgba(202,138,4,0.35)", text: "#f59e0b" };
  return (
    <span style={{
      background: color.bg, border: `1px solid ${color.border}`,
      color: color.text, borderRadius: "999px",
      fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.7rem", whiteSpace: "nowrap",
    }}>
      {estado}
    </span>
  );
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return "—";
  return d.toLocaleDateString("es-AR");
}

export default function MisBotsPage() {
  const { clients, setSelectedClientId, refreshClients } =
    useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName(""); setBusinessType(""); setWhatsapp(""); setError(""); setShowForm(false);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await insertRowAuth<Client>(
        "clients",
        { name: name.trim(), business_type: businessType || null, whatsapp: whatsapp || null, active: true },
        token,
      );
      setSelectedClientId(created.id);
      await refreshClients();
      resetForm();
      navigate("/dashboard/subscriptions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear bot");
    } finally {
      setSaving(false);
    }
  };

  const handleVer = (clientId: string) => {
    setSelectedClientId(clientId);
    navigate("/dashboard/subscriptions");
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem",
      }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Mis Bots</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
            Administra tus agentes de WhatsApp
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm((v) => !v)}
          style={{ fontSize: "0.85rem" }}
        >
          {showForm ? "Cancelar" : "Crear Nuevo Bot"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1rem" }}>Nuevo Bot</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre del negocio *</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Pizzería Roma" disabled={saving}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Tipo de negocio</label>
                <input
                  value={businessType} onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Ej: restaurante" disabled={saving}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">WhatsApp</label>
                <input
                  value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+5491100000000" disabled={saving}
                />
              </div>
            </div>
            {error && <div style={{ color: "#f87171", fontSize: "0.82rem", marginTop: "0.25rem" }}>{error}</div>}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: "0.85rem" }}>
                {saving ? "Creando..." : "Crear bot"}
              </button>
              <button type="button" onClick={resetForm} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "0.45rem 1rem",
                color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem",
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {clients.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🤖</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            No hay bots todavía. Creá el primero para empezar.
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre del negocio</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Soporte expira</th>
                  <th>Mensajes usados</th>
                  <th style={{ width: 80 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: 600 }}>{client.name}</td>
                    <td>{planBadge(client.plan)}</td>
                    <td>{estadoBadge(client.estado_pago)}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                      {formatFecha(client.fecha_expiracion_soporte)}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                      {client.mensajes_usados_este_mes ?? 0}
                    </td>
                    <td>
                      <button
                        onClick={() => handleVer(client.id)}
                        className="btn-primary"
                        style={{ fontSize: "0.78rem", padding: "0.3rem 0.9rem" }}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

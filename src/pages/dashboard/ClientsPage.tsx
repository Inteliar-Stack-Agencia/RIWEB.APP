import { type FormEvent, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { insertRowAuth, updateRowAuth } from "../../lib/supabase";
import type { Client } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

export default function ClientsPage() {
  const { clients, selectedClientId, setSelectedClientId, refreshClients } =
    useOutletContext<DashboardContext>();
  const { token } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName(""); setBusinessType(""); setWhatsapp("");
    setError(""); setEditingId(null); setShowForm(false);
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setName(client.name);
    setBusinessType(client.business_type || "");
    setWhatsapp(client.whatsapp || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateRowAuth("clients", editingId, {
          name: name.trim(),
          business_type: businessType || null,
          whatsapp: whatsapp || null,
        }, token);
      } else {
        const created = await insertRowAuth(
          "clients",
          { name: name.trim(), business_type: businessType || null, whatsapp: whatsapp || null, active: true },
          token,
        );
        setSelectedClientId(created.id);
      }
      await refreshClients();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cliente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Clientes</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { resetForm(); setShowForm((v) => !v); }}
          style={{ fontSize: "0.85rem" }}
        >
          {showForm && !editingId ? "Cancelar" : "+ Nuevo cliente"}
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1rem" }}>
            {editingId ? "Editar cliente" : "Nuevo cliente"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Pizzería Roma"
                  disabled={saving}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Tipo de negocio</label>
                <input
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Ej: restaurante"
                  disabled={saving}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">WhatsApp</label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+5491100000000"
                  disabled={saving}
                />
              </div>
            </div>
            {error && (
              <div style={{ color: "#f87171", fontSize: "0.82rem", margin: "0.25rem 0 0.5rem" }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: "0.85rem" }}>
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear cliente"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "0.45rem 1rem",
                  color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem",
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👥</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            No hay clientes todavía. Creá el primero para empezar.
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>WhatsApp</th>
                <th>Creado</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const isActive = selectedClientId === client.id;
                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{client.name}</div>
                    </td>
                    <td>
                      {client.business_type
                        ? <span className="admin-badge badge-amber">{client.business_type}</span>
                        : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                      {client.whatsapp || "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(client.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => startEdit(client)}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "0.28rem 0.7rem",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            transition: "all 0.15s",
                          }}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => setSelectedClientId(client.id)}
                          style={{
                            background: isActive ? "rgba(202,138,4,0.15)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isActive ? "rgba(202,138,4,0.35)" : "rgba(255,255,255,0.08)"}`,
                            borderRadius: "6px",
                            padding: "0.28rem 0.7rem",
                            color: isActive ? "#f59e0b" : "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            transition: "all 0.15s",
                          }}
                        >
                          {isActive ? "✓ Activo" : "Seleccionar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

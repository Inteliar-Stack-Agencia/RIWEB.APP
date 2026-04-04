import { type FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { insertRowAuth, listRowsAuth, updateRowAuth } from "../../lib/supabase";
import type { Ticket } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

const ESTADOS = ["abierto", "en_progreso", "resuelto", "cerrado"];
const PRIORIDADES = ["baja", "media", "alta", "urgente"];

function estadoColor(estado: string) {
  switch (estado) {
    case "abierto":      return { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)",   text: "#f87171" };
    case "en_progreso":  return { bg: "rgba(202,138,4,0.12)",   border: "rgba(202,138,4,0.35)",   text: "#f59e0b" };
    case "resuelto":     return { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)",   text: "#4ade80" };
    default:             return { bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.35)", text: "#94a3b8" };
  }
}

function prioridadColor(p: string | null) {
  switch (p) {
    case "urgente": return "#f87171";
    case "alta":    return "#f59e0b";
    case "media":   return "#60a5fa";
    default:        return "#94a3b8";
  }
}

function Badge({ text, color }: { text: string; color: { bg: string; border: string; text: string } }) {
  return (
    <span style={{
      background: color.bg, border: `1px solid ${color.border}`, color: color.text,
      borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700,
      padding: "0.18rem 0.6rem", whiteSpace: "nowrap",
    }}>
      {text.replace("_", " ")}
    </span>
  );
}

export default function TicketsPage() {
  const { selectedClientId, clients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Formulario nuevo ticket
  const [showForm, setShowForm] = useState(false);
  const [problema, setProblema] = useState("");
  const [telefono, setTelefono] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Ticket expandido
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editNotas, setEditNotas] = useState<Record<string, string>>({});
  const [editEstado, setEditEstado] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!selectedClientId || !token) return;
    setLoading(true);
    try {
      const data = await listRowsAuth<Ticket>(
        "tickets", token,
        `select=*&client_id=eq.${selectedClientId}&order=created_at.desc`,
      );
      setTickets(data);
      const notasMap: Record<string, string> = {};
      const estadoMap: Record<string, string> = {};
      data.forEach((t) => {
        notasMap[t.id] = t.notas ?? "";
        estadoMap[t.id] = t.estado;
      });
      setEditNotas(notasMap);
      setEditEstado(estadoMap);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [selectedClientId, token]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClientId || !problema.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await insertRowAuth("tickets", {
        client_id: selectedClientId,
        problema: problema.trim(),
        telefono: telefono.trim() || null,
        prioridad,
        estado: "abierto",
      }, token);
      setProblema(""); setTelefono(""); setPrioridad("media"); setShowForm(false);
      await fetchTickets();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al crear ticket");
    } finally { setSaving(false); }
  };

  const handleUpdate = async (ticket: Ticket) => {
    if (!token) return;
    setUpdatingId(ticket.id);
    try {
      await updateRowAuth<Ticket>("tickets", ticket.id, {
        estado: editEstado[ticket.id] ?? ticket.estado,
        notas: editNotas[ticket.id] ?? ticket.notas,
        updated_at: new Date().toISOString(),
      }, token);
      await fetchTickets();
      setExpanded(null);
    } catch { /* silencioso */ }
    finally { setUpdatingId(null); }
  };

  const visibles = filtroEstado === "todos"
    ? tickets
    : tickets.filter((t) => t.estado === filtroEstado);

  const conteo = ESTADOS.reduce((acc, e) => {
    acc[e] = tickets.filter((t) => t.estado === e).length;
    return acc;
  }, {} as Record<string, number>);

  if (!selectedClientId) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎫</div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
          Seleccioná un cliente para ver sus tickets.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Tickets</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
            Soporte y reparaciones — <strong style={{ color: "var(--text-main)" }}>{selectedClient?.name}</strong>
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)} style={{ fontSize: "0.85rem" }}>
          {showForm ? "Cancelar" : "+ Nuevo ticket"}
        </button>
      </div>

      {/* Contadores */}
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {[{ label: "Todos", key: "todos", count: tickets.length }, ...ESTADOS.map((e) => ({ label: e.replace("_", " "), key: e, count: conteo[e] ?? 0 }))].map(({ label, key, count }) => {
          const active = filtroEstado === key;
          return (
            <button
              key={key}
              onClick={() => setFiltroEstado(key)}
              style={{
                background: active ? "rgba(202,138,4,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(202,138,4,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "999px", padding: "0.28rem 0.85rem",
                color: active ? "#f59e0b" : "var(--text-muted)",
                cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Formulario nuevo ticket */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1rem" }}>Nuevo ticket</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="admin-form-label">Problema / Descripción *</label>
                <textarea
                  className="admin-textarea" rows={3} required
                  value={problema} onChange={(e) => setProblema(e.target.value)}
                  placeholder="Describí el problema o solicitud..."
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Teléfono del cliente</label>
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+5491100000000" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Prioridad</label>
                <select className="admin-select" style={{ width: "100%" }} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            {saveError && <div style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "0.5rem" }}>{saveError}</div>}
            <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: "0.85rem" }}>
              {saving ? "Creando..." : "Crear ticket"}
            </button>
          </form>
        </div>
      )}

      {/* Lista de tickets */}
      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando tickets...</div>
      ) : visibles.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🎫</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            {filtroEstado === "todos" ? "No hay tickets todavía." : `No hay tickets en estado "${filtroEstado}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {visibles.map((ticket) => {
            const isOpen = expanded === ticket.id;
            const ec = estadoColor(ticket.estado);
            return (
              <div key={ticket.id} className="admin-card" style={{ padding: "0.85rem 1rem" }}>
                {/* Fila principal */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", flexWrap: "wrap" }}
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ticket.problema}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {ticket.telefono && <span style={{ marginRight: "0.75rem" }}>📱 {ticket.telefono}</span>}
                      {new Date(ticket.created_at).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexShrink: 0 }}>
                    {ticket.prioridad && ticket.prioridad !== "baja" && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: prioridadColor(ticket.prioridad) }}>
                        ● {ticket.prioridad.toUpperCase()}
                      </span>
                    )}
                    <Badge text={ticket.estado} color={ec} />
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Panel expandido */}
                {isOpen && (
                  <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Estado</label>
                        <select
                          className="admin-select" style={{ width: "100%" }}
                          value={editEstado[ticket.id] ?? ticket.estado}
                          onChange={(e) => setEditEstado((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                        >
                          {ESTADOS.map((e) => <option key={e} value={e}>{e.replace("_", " ")}</option>)}
                        </select>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Notas internas</label>
                        <textarea
                          className="admin-textarea" rows={2}
                          value={editNotas[ticket.id] ?? ""}
                          onChange={(e) => setEditNotas((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Seguimiento, observaciones..."
                        />
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ fontSize: "0.82rem" }}
                      disabled={updatingId === ticket.id}
                      onClick={() => handleUpdate(ticket)}
                    >
                      {updatingId === ticket.id ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { type FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { insertRowAuth, listRowsAuth, updateRowAuth } from "../../lib/supabase";
import type { Proyecto } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

const ESTADOS = ["planificacion", "desarrollo", "revision", "entregado", "pausado"];
const TIPOS = ["landing page", "web corporativa", "ecommerce", "bot whatsapp", "app web", "otro"];

const ESTADO_META: Record<string, { label: string; color: { bg: string; border: string; text: string }; icon: string }> = {
  planificacion: { label: "Planificación", icon: "📋", color: { bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.35)", text: "#818cf8" } },
  desarrollo:    { label: "Desarrollo",    icon: "⚙️",  color: { bg: "rgba(202,138,4,0.12)",  border: "rgba(202,138,4,0.35)",  text: "#f59e0b" } },
  revision:      { label: "Revisión",      icon: "👁️",  color: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.35)", text: "#a78bfa" } },
  entregado:     { label: "Entregado",     icon: "✅",  color: { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.35)",  text: "#4ade80" } },
  pausado:       { label: "Pausado",       icon: "⏸️",  color: { bg: "rgba(100,116,139,0.12)",border: "rgba(100,116,139,0.35)",text: "#94a3b8" } },
};

function formatFecha(f: string | null) {
  if (!f) return "—";
  const d = new Date(f);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return "—";
  return d.toLocaleDateString("es-AR");
}

export default function ProyectosPage() {
  const { selectedClientId, clients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("planificacion");
  const [urlProd, setUrlProd] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fetchProyectos = async () => {
    if (!selectedClientId || !token) return;
    setLoading(true);
    try {
      const data = await listRowsAuth<Proyecto>(
        "proyectos", token,
        `select=*&client_id=eq.${selectedClientId}&order=created_at.desc`,
      );
      setProyectos(data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProyectos(); }, [selectedClientId, token]);

  const resetForm = () => {
    setNombre(""); setTipo(""); setEstado("planificacion");
    setUrlProd(""); setFechaInicio(""); setFechaEntrega(""); setNotas("");
    setSaveError(""); setEditingId(null); setShowForm(false);
  };

  const startEdit = (p: Proyecto) => {
    setEditingId(p.id);
    setNombre(p.nombre);
    setTipo(p.tipo ?? "");
    setEstado(p.estado);
    setUrlProd(p.url_produccion ?? "");
    setFechaInicio(p.fecha_inicio?.slice(0, 10) ?? "");
    setFechaEntrega(p.fecha_entrega?.slice(0, 10) ?? "");
    setNotas(p.notas ?? "");
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClientId || !nombre.trim()) return;
    setSaving(true);
    setSaveError("");
    const payload = {
      client_id: selectedClientId,
      nombre: nombre.trim(),
      tipo: tipo || null,
      estado,
      url_produccion: urlProd.trim() || null,
      fecha_inicio: fechaInicio || null,
      fecha_entrega: fechaEntrega || null,
      notas: notas.trim() || null,
    };
    try {
      if (editingId) {
        await updateRowAuth<Proyecto>("proyectos", editingId, payload, token);
      } else {
        await insertRowAuth("proyectos", payload, token);
      }
      resetForm();
      await fetchProyectos();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setSaving(false); }
  };

  if (!selectedClientId) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🗂️</div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
          Seleccioná un cliente para ver sus proyectos.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Proyectos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
            Sitios web y desarrollos — <strong style={{ color: "var(--text-main)" }}>{selectedClient?.name}</strong>
          </p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm((v) => !v); }} style={{ fontSize: "0.85rem" }}>
          {showForm && !editingId ? "Cancelar" : "+ Nuevo proyecto"}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1rem" }}>
            {editingId ? "Editar proyecto" : "Nuevo proyecto"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre *</label>
                <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Sitio web Vidriería" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Tipo</label>
                <select className="admin-select" style={{ width: "100%" }} value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="">— Seleccioná —</option>
                  {TIPOS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Estado</label>
                <select className="admin-select" style={{ width: "100%" }} value={estado} onChange={(e) => setEstado(e.target.value)}>
                  {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_META[e]?.label ?? e}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">URL en producción</label>
                <input value={urlProd} onChange={(e) => setUrlProd(e.target.value)} placeholder="https://micliente.com" type="url" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Fecha inicio</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Fecha entrega</label>
                <input type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
              </div>
              <div className="admin-form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="admin-form-label">Notas</label>
                <textarea className="admin-textarea" rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Detalles, pendientes, observaciones..." />
              </div>
            </div>
            {saveError && <div style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "0.5rem" }}>{saveError}</div>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: "0.85rem" }}>
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear proyecto"}
              </button>
              <button type="button" onClick={resetForm} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.45rem 1rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem" }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando proyectos...</div>
      ) : proyectos.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🗂️</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>No hay proyectos todavía.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {proyectos.map((p) => {
            const meta = ESTADO_META[p.estado] ?? ESTADO_META["pausado"];
            return (
              <div key={p.id} className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {/* Top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{p.nombre}</div>
                    {p.tipo && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem", textTransform: "capitalize" }}>{p.tipo}</div>}
                  </div>
                  <span style={{
                    background: meta.color.bg, border: `1px solid ${meta.color.border}`,
                    color: meta.color.text, borderRadius: "999px",
                    fontSize: "0.7rem", fontWeight: 700, padding: "0.18rem 0.6rem", whiteSpace: "nowrap",
                  }}>
                    {meta.icon} {meta.label}
                  </span>
                </div>

                {/* Fechas */}
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  <span>Inicio: <strong style={{ color: "var(--text-main)" }}>{formatFecha(p.fecha_inicio)}</strong></span>
                  <span>Entrega: <strong style={{ color: "var(--text-main)" }}>{formatFecha(p.fecha_entrega)}</strong></span>
                </div>

                {/* URL */}
                {p.url_produccion && (
                  <a
                    href={p.url_produccion} target="_blank" rel="noreferrer"
                    style={{ fontSize: "0.78rem", color: "#f59e0b", textDecoration: "none", wordBreak: "break-all" }}
                  >
                    🔗 {p.url_produccion}
                  </a>
                )}

                {/* Notas */}
                {p.notas && (
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                    {p.notas}
                  </div>
                )}

                {/* Acciones */}
                <div style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    onClick={() => startEdit(p)}
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "6px", padding: "0.28rem 0.7rem",
                      color: "var(--text-muted)", cursor: "pointer", fontSize: "0.76rem", fontWeight: 600,
                    }}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

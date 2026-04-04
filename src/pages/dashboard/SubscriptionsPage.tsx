import { type FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listRowsAuth, updateRowAuth } from "../../lib/supabase";
import type { Client, Pago } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

const PLANS = ["starter", "pro", "enterprise", "custom"];
const PAYMENT_STATES = ["pending", "partial", "paid", "overdue", "cancelled"];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function SupportBadge({ fecha }: { fecha: string | null }) {
  const days = daysUntil(fecha);
  if (days === null) return <span className="admin-badge badge-gray">Sin fecha</span>;
  if (days < 0)  return <span className="admin-badge" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>Vencido hace {Math.abs(days)}d</span>;
  if (days <= 30) return <span className="admin-badge" style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>Vence en {days}d</span>;
  return <span className="admin-badge badge-green">Vigente · {days}d restantes</span>;
}

function PaymentBadge({ estado }: { estado: string | null }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    paid:      { bg: "rgba(34,197,94,0.15)",  color: "#4ade80", label: "Pagado" },
    partial:   { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", label: "Parcial" },
    pending:   { bg: "rgba(148,163,184,0.12)",color: "#94a3b8", label: "Pendiente" },
    overdue:   { bg: "rgba(239,68,68,0.15)",  color: "#f87171", label: "Vencido" },
    cancelled: { bg: "rgba(148,163,184,0.12)",color: "#64748b", label: "Cancelado" },
  };
  const s = map[estado ?? ""] ?? map.pending;
  return <span className="admin-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function SubscriptionsPage() {
  const { selectedClientId, clients, refreshClients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const client = clients.find((c) => c.id === selectedClientId) as Client | undefined;

  const [pagos, setPagos]     = useState<Pago[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  // Form state
  const [form, setForm] = useState({
    plan: "", precio_base: "", precio_total: "",
    estado_pago: "", pago_50_percent: "", pago_final: "",
    fecha_contratacion: "", fecha_entrega_estimada: "",
    fecha_entrega_real: "", fecha_expiracion_soporte: "",
    hosting_proveedor: "", hosting_url: "", dominio: "",
    dominio_propio: false,
  });

  useEffect(() => {
    if (!client) return;
    setForm({
      plan:                    client.plan ?? "",
      precio_base:             String(client.precio_base ?? ""),
      precio_total:            String(client.precio_total ?? ""),
      estado_pago:             client.estado_pago ?? "pending",
      pago_50_percent:         String(client.pago_50_percent ?? ""),
      pago_final:              String(client.pago_final ?? ""),
      fecha_contratacion:      client.fecha_contratacion?.slice(0,10) ?? "",
      fecha_entrega_estimada:  client.fecha_entrega_estimada?.slice(0,10) ?? "",
      fecha_entrega_real:      client.fecha_entrega_real?.slice(0,10) ?? "",
      fecha_expiracion_soporte:client.fecha_expiracion_soporte?.slice(0,10) ?? "",
      hosting_proveedor:       client.hosting_proveedor ?? "",
      hosting_url:             client.hosting_url ?? "",
      dominio:                 client.dominio ?? "",
      dominio_propio:          client.dominio_propio ?? false,
    });
    setEditing(false);
  }, [selectedClientId, client?.id]);

  useEffect(() => {
    if (!selectedClientId || !token) { setPagos([]); return; }
    listRowsAuth<Pago>(
      "pagos", token,
      `select=*&client_id=eq.${selectedClientId}&order=created_at.desc`,
    ).then(setPagos).catch(() => setPagos([]));
  }, [selectedClientId, token]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClientId) return;
    setSaving(true); setError(""); setSuccess(false);
    try {
      await updateRowAuth<Client>("clients", selectedClientId, {
        plan:                    form.plan || null,
        precio_base:             form.precio_base ? Number(form.precio_base) : null,
        precio_total:            form.precio_total ? Number(form.precio_total) : null,
        estado_pago:             form.estado_pago || null,
        pago_50_percent:         form.pago_50_percent ? Number(form.pago_50_percent) : null,
        pago_final:              form.pago_final ? Number(form.pago_final) : null,
        fecha_contratacion:      form.fecha_contratacion || null,
        fecha_entrega_estimada:  form.fecha_entrega_estimada || null,
        fecha_entrega_real:      form.fecha_entrega_real || null,
        fecha_expiracion_soporte:form.fecha_expiracion_soporte || null,
        hosting_proveedor:       form.hosting_proveedor || null,
        hosting_url:             form.hosting_url || null,
        dominio:                 form.dominio || null,
        dominio_propio:          form.dominio_propio,
      } as Partial<Client>, token);
      await refreshClients();
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>💳</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>Seleccioná un cliente</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
          Seleccioná un cliente para ver su suscripción y pagos.
        </p>
      </div>
    );
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Suscripción</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
            Plan y facturación de <strong style={{ color: "var(--text-main)" }}>{client?.name}</strong>
          </p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-primary"
            style={{ fontSize: "0.82rem", padding: "0.55rem 1.1rem", borderRadius: "10px" }}>
            ✏️ Editar
          </button>
        )}
      </div>

      {success && (
        <div style={{ marginBottom: "1rem", padding: "0.65rem 1rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "8px", color: "#4ade80", fontSize: "0.85rem" }}>
          Suscripción actualizada correctamente
        </div>
      )}
      {error && (
        <div style={{ marginBottom: "1rem", padding: "0.65rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {editing ? (
        /* ── FORM DE EDICIÓN ─────────────────────────────────── */
        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>

            {/* Plan */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Plan</h3>
              <div className="admin-form-group">
                <label className="admin-form-label">Plan</label>
                <select className="admin-select" value={form.plan} onChange={f("plan")}>
                  <option value="">— Sin plan —</option>
                  {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Estado de pago</label>
                <select className="admin-select" value={form.estado_pago} onChange={f("estado_pago")}>
                  {PAYMENT_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Precio base ($)</label>
                  <input type="number" value={form.precio_base} onChange={f("precio_base")} placeholder="0" />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Precio total ($)</label>
                  <input type="number" value={form.precio_total} onChange={f("precio_total")} placeholder="0" />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Pago 50% ($)</label>
                  <input type="number" value={form.pago_50_percent} onChange={f("pago_50_percent")} placeholder="0" />
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label className="admin-form-label">Pago final ($)</label>
                  <input type="number" value={form.pago_final} onChange={f("pago_final")} placeholder="0" />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fechas</h3>
              {[
                ["fecha_contratacion", "Contratación"],
                ["fecha_entrega_estimada", "Entrega estimada"],
                ["fecha_entrega_real", "Entrega real"],
                ["fecha_expiracion_soporte", "Vencimiento soporte"],
              ].map(([key, label]) => (
                <div className="admin-form-group" key={key}>
                  <label className="admin-form-label">{label}</label>
                  <input type="date" value={form[key as keyof typeof form] as string}
                    onChange={f(key as keyof typeof form)} />
                </div>
              ))}
            </div>

            {/* Hosting */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hosting</h3>
              <div className="admin-form-group">
                <label className="admin-form-label">Proveedor</label>
                <input type="text" value={form.hosting_proveedor} onChange={f("hosting_proveedor")} placeholder="Cloudflare Pages, Railway..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">URL del sitio</label>
                <input type="text" value={form.hosting_url} onChange={f("hosting_url")} placeholder="https://..." />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Dominio</label>
                <input type="text" value={form.dominio} onChange={f("dominio")} placeholder="ejemplo.com" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input type="checkbox" id="dominio_propio" checked={form.dominio_propio}
                  onChange={f("dominio_propio")} style={{ width: "auto" }} />
                <label htmlFor="dominio_propio" style={{ fontSize: "0.83rem", color: "var(--text-muted)", cursor: "pointer" }}>
                  Dominio propio del cliente
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn-primary" disabled={saving}
              style={{ fontSize: "0.85rem", padding: "0.65rem 1.5rem", borderRadius: "10px", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "0.65rem 1.25rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem" }}>
              Cancelar
            </button>
          </div>
        </form>

      ) : (
        /* ── VISTA DE SOLO LECTURA ───────────────────────────── */
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>

            {/* Plan y facturación */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.75rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan y facturación</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <Row label="Plan" value={client?.plan ? client.plan.charAt(0).toUpperCase() + client.plan.slice(1) : "—"} />
                <Row label="Estado" value={<PaymentBadge estado={client?.estado_pago ?? null} />} />
                <Row label="Precio base" value={client?.precio_base != null ? `$${client.precio_base}` : "—"} />
                <Row label="Precio total" value={client?.precio_total != null ? `$${client.precio_total}` : "—"} />
                <Row label="Pago 50%" value={client?.pago_50_percent != null ? `$${client.pago_50_percent}` : "—"} />
                <Row label="Pago final" value={client?.pago_final != null ? `$${client.pago_final}` : "—"} />
              </div>
            </div>

            {/* Fechas */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.75rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Fechas</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <Row label="Contratación" value={formatDate(client?.fecha_contratacion ?? null)} />
                <Row label="Entrega estimada" value={formatDate(client?.fecha_entrega_estimada ?? null)} />
                <Row label="Entrega real" value={formatDate(client?.fecha_entrega_real ?? null)} />
                <Row label="Soporte hasta" value={
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {formatDate(client?.fecha_expiracion_soporte ?? null)}
                    <SupportBadge fecha={client?.fecha_expiracion_soporte ?? null} />
                  </span>
                } />
              </div>
            </div>

            {/* Hosting */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.75rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Hosting</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <Row label="Proveedor" value={client?.hosting_proveedor ?? "—"} />
                <Row label="URL" value={
                  client?.hosting_url
                    ? <a href={client.hosting_url} target="_blank" rel="noreferrer"
                        style={{ color: "#f59e0b", textDecoration: "none", fontSize: "0.82rem" }}>
                        {client.hosting_url}
                      </a>
                    : "—"
                } />
                <Row label="Dominio" value={client?.dominio ?? "—"} />
                <Row label="Dominio propio" value={client?.dominio_propio ? "✓ Sí" : "No"} />
              </div>
            </div>

            {/* Uso */}
            <div className="admin-card">
              <h3 style={{ fontSize: "0.75rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Uso este mes</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                <Row label="Mensajes bot" value={String(client?.mensajes_usados_este_mes ?? 0)} />
                <Row label="Leads capturados" value={String(client?.leads_capturados ?? 0)} />
                <Row label="Créditos disponibles" value={String(client?.creditos_disponibles ?? 0)} />
              </div>
            </div>
          </div>

          {/* Historial de pagos */}
          <div style={{ marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Historial de pagos</h2>
          </div>
          {pagos.length === 0 ? (
            <div className="admin-card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No hay pagos registrados para este cliente.
            </div>
          ) : (
            <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Método</th>
                      <th>Fecha pago</th>
                      <th>Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.concepto}</td>
                        <td>${p.monto} {p.moneda ?? "USD"}</td>
                        <td><PaymentBadge estado={p.estado} /></td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>{p.metodo_pago ?? "—"}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{formatDate(p.fecha_pagado)}</td>
                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{formatDate(p.fecha_vencimiento)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

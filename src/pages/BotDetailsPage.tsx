import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Locale } from "../types";
import { getSingle, listRows, updateRow } from "../lib/supabase";

interface Bot {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  plan: "starter" | "pro" | "custom";
  precio_base: number;
  precio_total: number;
  estado_pago: "pending" | "pagado" | "vencido";
  pago_50_percent?: number;
  pago_final?: number;
  fecha_contratacion: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  fecha_expiracion_soporte: string;
  hosting_proveedor?: string;
  hosting_url?: string;
  dominio?: string;
  dominio_propio?: boolean;
  creditos_disponibles?: number;
  mensajes_usados_este_mes?: number;
  leads_capturados?: number;
  active: boolean;
  created_at: string;
}

interface Payment {
  id: string;
  concepto: string;
  monto: number;
  estado: "pendiente" | "pagado" | "rechazado";
  metodo_pago?: string;
  fecha_pagado?: string;
  created_at: string;
}

interface Extra {
  id: string;
  nombre: string;
  costo_mensual?: number;
  costo_unico?: number;
  estado: "activo" | "cancelado" | "pausado";
  fecha_inicio: string;
}

export default function BotDetailsPage({ locale }: { locale: Locale }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Bot>>({});

  const labels = {
    en: {
      back: "← Back to Bots",
      title: "Bot Details",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      goAdmin: "Go to Admin",
      basicInfo: "Basic Information",
      payments: "Payments",
      extras: "Extras",
      support: "Support",
      hosting: "Hosting",
      name: "Business Name",
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp Number",
      plan: "Plan",
      status: "Payment Status",
      contractDate: "Contract Date",
      deliveryDate: "Delivery Date",
      supportExpires: "Support Expires",
      domain: "Domain",
      hosting: "Hosting",
      messages: "Messages Used",
      leads: "Leads Captured",
      noPayments: "No payments yet",
      noPagado: "Not paid",
      pagado: "Paid",
      pending: "Pending",
      concept: "Concept",
      amount: "Amount",
      date: "Date",
      noExtras: "No extras contracted",
      extra: "Extra",
      cost: "Cost",
      status: "Status",
      active: "Active",
      canceled: "Canceled",
      paused: "Paused",
      loading: "Loading...",
      error: "Error loading bot",
      starter: "Starter ($65)",
      pro: "Pro ($120)",
    },
    es: {
      back: "← Volver a Bots",
      title: "Detalles del Bot",
      edit: "Editar",
      save: "Guardar",
      cancel: "Cancelar",
      goAdmin: "Ir a Admin",
      basicInfo: "Información Básica",
      payments: "Pagos",
      extras: "Complementos",
      support: "Soporte",
      hosting: "Hosting",
      name: "Nombre del Negocio",
      email: "Email",
      phone: "Teléfono",
      whatsapp: "Número WhatsApp",
      plan: "Plan",
      status: "Estado de Pago",
      contractDate: "Fecha Contrato",
      deliveryDate: "Fecha Entrega",
      supportExpires: "Soporte Expira",
      domain: "Dominio",
      hosting: "Hosting",
      messages: "Mensajes Usados",
      leads: "Leads Capturados",
      noPayments: "Sin pagos aún",
      noPagado: "No pagado",
      pagado: "Pagado",
      pending: "Pendiente",
      concept: "Concepto",
      amount: "Monto",
      date: "Fecha",
      noExtras: "Sin complementos contratados",
      extra: "Complemento",
      cost: "Costo",
      status: "Estado",
      active: "Activo",
      canceled: "Cancelado",
      paused: "Pausado",
      loading: "Cargando...",
      error: "Error cargando bot",
      starter: "Starter ($65)",
      pro: "Pro ($120)",
    },
  };

  const t = labels[locale];

  useEffect(() => {
    loadBot();
  }, [id]);

  async function loadBot() {
    try {
      setLoading(true);
      if (!id) throw new Error("No bot ID");

      const botData = await getSingle<Bot>("clients", id);
      if (!botData) throw new Error("Bot not found");

      setBot(botData);
      setEditData(botData);

      const paymentsData = await listRows<Payment>("pagos", `select=*&client_id=eq.${id}&order=created_at.desc`);
      setPayments(paymentsData || []);

      const extrasData = await listRows<Extra>("extras_contratados", `select=*&client_id=eq.${id}`);
      setExtras(extrasData || []);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (!bot?.id) return;
      await updateRow("clients", bot.id, editData);
      setBot({ ...bot, ...editData });
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving");
    }
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem", color: "#44403C" }}>{t.loading}</div>;
  }

  if (!bot) {
    return (
      <div>
        <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
          {t.back}
        </button>
        <div style={{ color: "#EF4444" }}>{error || "Bot not found"}</div>
      </div>
    );
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "—";
    const d = new Date(date);
    return locale === "es" ? d.toLocaleDateString("es-AR") : d.toLocaleDateString("en-US");
  };

  const getStatusColor = (status: string) => {
    if (status === "pagado") return { bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" };
    if (status === "pending") return { bg: "rgba(245, 158, 11, 0.15)", text: "#F59E0B" };
    return { bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" };
  };

  const statusColor = getStatusColor(bot.estado_pago);

  return (
    <div>
      <style>{`
        .back-btn {
          background: transparent;
          border: none;
          color: #CA8A04;
          cursor: pointer;
          font-size: 1rem;
          text-decoration: none;
          margin-bottom: 1.5rem;
        }

        .back-btn:hover {
          opacity: 0.8;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .details-header h1 {
          margin: 0;
          color: #1C1917;
          font-size: 2.5rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .header-actions button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 200ms ease;
        }

        .header-actions button:hover {
          filter: brightness(1.1);
        }

        .btn-primary {
          background: #CA8A04;
          color: white;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #44403C;
          color: #44403C;
        }

        .btn-secondary:hover {
          background: rgba(68, 64, 60, 0.05);
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        }

        .card h3 {
          margin: 0 0 1.5rem;
          color: #1C1917;
          font-size: 1.25rem;
        }

        .info-row {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          color: #44403C;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .info-value {
          color: #1C1917;
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .table th {
          background: rgba(28, 25, 23, 0.05);
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #1C1917;
          font-size: 0.875rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #0C0A09;
        }

        .table tbody tr:hover {
          background: rgba(202, 138, 4, 0.03);
        }

        .empty-msg {
          text-align: center;
          color: #44403C;
          padding: 1rem;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #1C1917;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #CA8A04;
          box-shadow: 0 0 0 3px rgba(202, 138, 4, 0.1);
        }

        @media (max-width: 768px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }

          .details-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }
        }
      `}</style>

      <button onClick={() => navigate(-1)} className="back-btn">
        {t.back}
      </button>

      <div className="details-header">
        <h1>{bot.name}</h1>
        <div className="header-actions">
          {editMode ? (
            <>
              <button className="btn-primary" onClick={handleSave}>
                {t.save}
              </button>
              <button className="btn-secondary" onClick={() => setEditMode(false)}>
                {t.cancel}
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => setEditMode(true)}>
                {t.edit}
              </button>
              <button className="btn-secondary" onClick={() => window.open(`/admin?client=${bot.id}`, "_blank")}>
                {t.goAdmin}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: "#EF4444", padding: "1rem", background: "rgba(239, 68, 68, 0.1)", borderRadius: "10px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="grid-2">
        {/* BASIC INFO */}
        <div className="card">
          <h3>{t.basicInfo}</h3>

          {editMode ? (
            <>
              <div className="form-group">
                <label>{t.name}</label>
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.email}</label>
                <input
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.phone}</label>
                <input
                  type="tel"
                  value={editData.phone || ""}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.whatsapp}</label>
                <input
                  type="tel"
                  value={editData.whatsapp || ""}
                  onChange={(e) => setEditData({ ...editData, whatsapp: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="info-row">
                <span className="info-label">{t.email}</span>
                <span className="info-value">{bot.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.phone}</span>
                <span className="info-value">{bot.phone || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.whatsapp}</span>
                <span className="info-value">{bot.whatsapp || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.plan}</span>
                <span className="info-value">{bot.plan === "pro" ? t.pro : t.starter}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.status}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColor.bg, color: statusColor.text }}
                >
                  {bot.estado_pago === "pagado" ? t.pagado : bot.estado_pago === "pending" ? t.pending : t.noPagado}
                </span>
              </div>
            </>
          )}
        </div>

        {/* SUPPORT & HOSTING */}
        <div className="card">
          <h3>{t.support}</h3>

          {editMode ? (
            <>
              <div className="form-group">
                <label>{t.contractDate}</label>
                <input
                  type="date"
                  value={editData.fecha_contratacion || ""}
                  onChange={(e) => setEditData({ ...editData, fecha_contratacion: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.deliveryDate}</label>
                <input
                  type="date"
                  value={editData.fecha_entrega_real || ""}
                  onChange={(e) => setEditData({ ...editData, fecha_entrega_real: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.supportExpires}</label>
                <input
                  type="date"
                  value={editData.fecha_expiracion_soporte || ""}
                  onChange={(e) => setEditData({ ...editData, fecha_expiracion_soporte: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              <div className="info-row">
                <span className="info-label">{t.contractDate}</span>
                <span className="info-value">{formatDate(bot.fecha_contratacion)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.deliveryDate}</span>
                <span className="info-value">{formatDate(bot.fecha_entrega_real)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.supportExpires}</span>
                <span className="info-value">{formatDate(bot.fecha_expiracion_soporte)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.messages}</span>
                <span className="info-value">{bot.mensajes_usados_este_mes || 0}</span>
              </div>
              <div className="info-row">
                <span className="info-label">{t.leads}</span>
                <span className="info-value">{bot.leads_capturados || 0}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PAYMENTS */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>{t.payments}</h3>
        {payments.length === 0 ? (
          <div className="empty-msg">{t.noPayments}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t.concept}</th>
                <th>{t.amount}</th>
                <th>{t.status}</th>
                <th>{t.date}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.concepto}</td>
                  <td>${payment.monto.toFixed(2)}</td>
                  <td>
                    <span style={{ color: payment.estado === "pagado" ? "#22C55E" : "#F59E0B", fontWeight: 600 }}>
                      {payment.estado === "pagado" ? t.pagado : t.pending}
                    </span>
                  </td>
                  <td>{formatDate(payment.fecha_pagado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EXTRAS */}
      <div className="card">
        <h3>{t.extras}</h3>
        {extras.length === 0 ? (
          <div className="empty-msg">{t.noExtras}</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t.extra}</th>
                <th>{t.cost}</th>
                <th>{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {extras.map((extra) => (
                <tr key={extra.id}>
                  <td>{extra.nombre}</td>
                  <td>${(extra.costo_mensual || extra.costo_unico || 0).toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        color:
                          extra.estado === "activo"
                            ? "#22C55E"
                            : extra.estado === "pausado"
                              ? "#F59E0B"
                              : "#EF4444",
                        fontWeight: 600,
                      }}
                    >
                      {extra.estado === "activo" ? t.active : extra.estado === "pausado" ? t.paused : t.canceled}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

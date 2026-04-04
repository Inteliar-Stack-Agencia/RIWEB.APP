import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listRowsAuth } from "../../lib/supabase";
import type { BotLead } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function LeadsPage() {
  const { selectedClientId, clients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const [leads, setLeads]   = useState<BotLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!selectedClientId || !token) { setLeads([]); return; }
    setLoading(true);
    setError("");
    listRowsAuth<BotLead>(
      "bot_leads",
      token,
      `select=*&client_id=eq.${selectedClientId}&order=created_at.desc`,
    )
      .then(setLeads)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedClientId, token]);

  if (!selectedClientId) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
          Seleccioná un cliente
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
          Seleccioná un cliente para ver sus leads capturados.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Leads</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
          {leads.length} lead{leads.length !== 1 ? "s" : ""} de{" "}
          <strong style={{ color: "var(--text-main)" }}>{selectedClient?.name}</strong>
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando leads...</div>
      ) : error ? (
        <div style={{ color: "#f87171", fontSize: "0.85rem" }}>{error}</div>
      ) : leads.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            No hay leads todavía para este cliente.
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Mensaje</th>
                <th>Teléfono</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {lead.name ?? <span style={{ color: "var(--text-muted)" }}>Sin nombre</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.83rem", maxWidth: 280 }}>
                    <span style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}>
                      {lead.message ?? "—"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                    {lead.phone ?? "—"}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                    {formatDate(lead.created_at)}
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

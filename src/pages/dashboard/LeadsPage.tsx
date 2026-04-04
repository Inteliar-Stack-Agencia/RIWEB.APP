import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listRowsAuth } from "../../lib/supabase";
import type { BotLead, Conversation } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatConvAsExample(convs: Conversation[]): string {
  return convs
    .map((m) => `${m.role === "user" ? "Cliente" : "Bot"}: ${m.content}`)
    .join("\n");
}

export default function LeadsPage() {
  const { selectedClientId, clients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const [leads, setLeads]         = useState<BotLead[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Panel de conversación
  const [selectedLead, setSelectedLead]     = useState<BotLead | null>(null);
  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [convLoading, setConvLoading]       = useState(false);
  const [copied, setCopied]                 = useState(false);

  useEffect(() => {
    if (!selectedClientId || !token) { setLeads([]); setSelectedLead(null); return; }
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

  // Cargar conversación completa al seleccionar un lead
  const openLead = async (lead: BotLead) => {
    setSelectedLead(lead);
    if (!token || !lead.phone) { setConversations([]); return; }
    setConvLoading(true);
    try {
      const data = await listRowsAuth<Conversation>(
        "conversations",
        token,
        `select=*&client_id=eq.${selectedClientId}&telefono=eq.${encodeURIComponent(lead.phone)}&order=created_at.asc&limit=100`,
      );
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setConvLoading(false);
    }
  };

  const copiarComoEjemplo = async () => {
    const texto = `\n\n## Ejemplo de conversación real\n\n${formatConvAsExample(conversations)}\n\n## Fin del ejemplo`;
    await navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!selectedClientId) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
          Seleccioná un cliente
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
          Seleccioná un cliente para ver sus leads y conversaciones.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>

      {/* ── Lista de leads ─────────────────────────────────────────── */}
      <div style={{ flex: selectedLead ? "0 0 340px" : "1", minWidth: 0 }}>
        <div style={{ marginBottom: "1rem" }}>
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
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => openLead(lead)}
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  background: selectedLead?.id === lead.id ? "rgba(202,138,4,0.08)" : "transparent",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (selectedLead?.id !== lead.id)
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (selectedLead?.id !== lead.id)
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    {lead.name ?? <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>Sin nombre</span>}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", flexShrink: 0 }}>
                    {formatDate(lead.created_at)}
                  </span>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                  {lead.phone ?? "—"}
                </div>
                {lead.message && (
                  <div style={{
                    color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.25rem",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {lead.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Panel de conversación ───────────────────────────────────── */}
      {selectedLead && (
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header del panel */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                {selectedLead.name ?? selectedLead.phone ?? "Conversación"}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: "0.1rem 0 0" }}>
                {selectedLead.phone} · {conversations.length} mensajes
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {conversations.length > 0 && (
                <button
                  onClick={copiarComoEjemplo}
                  className="btn-primary"
                  style={{ fontSize: "0.78rem", padding: "0.5rem 0.9rem", borderRadius: "8px" }}
                >
                  {copied ? "✓ Copiado" : "📋 Copiar como ejemplo"}
                </button>
              )}
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "0.45rem 0.75rem",
                  color: "var(--text-muted)", cursor: "pointer", fontSize: "0.78rem",
                }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>

          {/* Hint copiado */}
          {copied && (
            <div style={{
              marginBottom: "0.75rem", padding: "0.6rem 0.9rem",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: "8px", fontSize: "0.8rem", color: "#4ade80",
            }}>
              Conversación copiada. Pegala en el System Prompt de este cliente como ejemplo de respuesta ideal.
            </div>
          )}

          {/* Hilo de mensajes */}
          <div className="admin-card" style={{ padding: "1rem", maxHeight: "65vh", overflowY: "auto" }}>
            {convLoading ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: "2rem" }}>
                Cargando conversación...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: "2rem" }}>
                No hay mensajes registrados para este número.<br />
                <span style={{ fontSize: "0.75rem" }}>
                  El bot guarda conversaciones cuando tiene <code>SUPABASE_URL</code> configurado.
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {conversations.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
                    }}
                  >
                    <div style={{
                      maxWidth: "80%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: msg.role === "user" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                      background: msg.role === "user"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(202,138,4,0.15)",
                      border: msg.role === "user"
                        ? "1px solid rgba(255,255,255,0.07)"
                        : "1px solid rgba(202,138,4,0.25)",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                    }}>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", marginBottom: "0.2rem", fontWeight: 600 }}>
                        {msg.role === "user" ? "👤 Cliente" : "🤖 Bot"}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.65rem", marginTop: "0.3rem", textAlign: "right" }}>
                        {formatDate(msg.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

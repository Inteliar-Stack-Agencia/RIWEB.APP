import { type FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { insertRowAuth, listRowsAuth, updateRowAuth } from "../../lib/supabase";
import type { AIPrompt } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

const TONES       = ["amigable", "profesional", "directo", "formal", "casual"];
const OBJECTIVES  = ["ventas", "soporte", "reservas", "información"];
const BIZ_TYPES   = [
  "restaurante", "tienda de ropa", "servicio técnico", "salud y belleza",
  "gym / fitness", "ecommerce", "inmobiliaria", "educación", "otro",
];

function defaultPrompt(clientName: string, biz: string) {
  return `Sos un asistente de ventas IA para ${clientName || "este negocio"}${biz ? `, un negocio de ${biz}` : ""}.

Tu objetivo es responder consultas, brindar información y ayudar a cerrar ventas.

Instrucciones:
- Respondé en español argentino (vos, podés, tenés)
- Sé amigable y conciso (máximo 2-3 oraciones)
- No menciones que sos IA
- Terminá cada respuesta con una pregunta breve
- Si el cliente quiere comprar, guialo a concretar

Información del negocio:
[Completar: horarios, precios, productos, dirección, etc.]`;
}

export default function BotPage() {
  const { selectedClientId, clients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const [prompt, setPrompt] = useState<AIPrompt | null>(null);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");

  // Form state
  const [bizType, setBizType]       = useState("");
  const [tone, setTone]             = useState("amigable");
  const [objective, setObjective]   = useState("ventas");
  const [sysPrompt, setSysPrompt]   = useState("");

  useEffect(() => {
    if (!selectedClientId || !token) {
      setPrompt(null);
      return;
    }
    setLoading(true);
    setError("");
    listRowsAuth<AIPrompt>(
      "ai_prompts",
      token,
      `select=*&client_id=eq.${selectedClientId}&active=eq.true&limit=1`,
    )
      .then((data) => {
        const p = data[0] ?? null;
        setPrompt(p);
        if (p) {
          setBizType(p.business_type ?? "");
          setTone(p.tone);
          setObjective(p.objective ?? "ventas");
          setSysPrompt(p.system_prompt ?? "");
        } else {
          setBizType(selectedClient?.business_type ?? "");
          setTone("amigable");
          setObjective("ventas");
          setSysPrompt(defaultPrompt(selectedClient?.name ?? "", selectedClient?.business_type ?? ""));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedClientId, token]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClientId) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    const payload = {
      client_id: selectedClientId,
      system_prompt: sysPrompt,
      tone,
      business_type: bizType || null,
      objective,
      active: true,
      updated_at: new Date().toISOString(),
    };
    try {
      if (prompt?.id) {
        await updateRowAuth<AIPrompt>("ai_prompts", prompt.id, payload, token);
      } else {
        const created = await insertRowAuth("ai_prompts", payload, token);
        setPrompt({ ...payload, id: created.id, created_at: new Date().toISOString() } as AIPrompt);
      }
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
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🤖</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
          Seleccioná un cliente
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
          Usá el selector del header para ver y configurar el bot de un cliente.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Bot / Prompts</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
          Configuración del asistente IA para{" "}
          <strong style={{ color: "var(--text-main)" }}>{selectedClient?.name}</strong>
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando configuración...</div>
      ) : (
        <form onSubmit={handleSave}>

          {/* Row 1: tipo + tono */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="admin-card">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Tipo de negocio</label>
                <select className="admin-select" style={{ width: "100%" }} value={bizType} onChange={(e) => setBizType(e.target.value)}>
                  <option value="">— Seleccioná —</option>
                  {BIZ_TYPES.map((bt) => (
                    <option key={bt} value={bt}>{bt.charAt(0).toUpperCase() + bt.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <label className="admin-form-label">Tono</label>
                <select className="admin-select" style={{ width: "100%" }} value={tone} onChange={(e) => setTone(e.target.value)}>
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: objetivo */}
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Objetivo principal</label>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                {OBJECTIVES.map((obj) => {
                  const sel = objective === obj;
                  return (
                    <label
                      key={obj}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.4rem",
                        padding: "0.35rem 0.9rem", borderRadius: "999px", cursor: "pointer",
                        border: `1px solid ${sel ? "rgba(202,138,4,0.45)" : "rgba(255,255,255,0.1)"}`,
                        background: sel ? "rgba(202,138,4,0.12)" : "transparent",
                        color: sel ? "#f59e0b" : "var(--text-muted)",
                        fontSize: "0.85rem", fontWeight: 500, transition: "all 0.12s",
                      }}
                    >
                      <input
                        type="radio" name="objective" value={obj}
                        checked={sel} onChange={() => setObjective(obj)}
                        style={{ display: "none" }}
                      />
                      {obj.charAt(0).toUpperCase() + obj.slice(1)}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* System prompt */}
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className="admin-form-label" style={{ margin: 0 }}>System prompt</label>
                <button
                  type="button"
                  onClick={() => setSysPrompt(defaultPrompt(selectedClient?.name ?? "", bizType))}
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px", padding: "0.22rem 0.6rem",
                    color: "var(--text-muted)", cursor: "pointer", fontSize: "0.74rem",
                  }}
                >
                  ↺ Regenerar
                </button>
              </div>
              <textarea
                className="admin-textarea"
                style={{ width: "100%" }}
                rows={11}
                value={sysPrompt}
                onChange={(e) => setSysPrompt(e.target.value)}
                placeholder="Escribí las instrucciones del bot aquí..."
              />
              <div style={{ textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                {sysPrompt.length} caracteres
              </div>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div style={{
              padding: "0.65rem 0.9rem", borderRadius: "8px", marginBottom: "1rem",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", fontSize: "0.85rem",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: "0.65rem 0.9rem", borderRadius: "8px", marginBottom: "1rem",
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              color: "#4ade80", fontSize: "0.85rem",
            }}>
              ✓ Configuración guardada correctamente
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "💾 Guardar configuración"}
          </button>
        </form>
      )}
    </div>
  );
}

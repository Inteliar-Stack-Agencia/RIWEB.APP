import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { insertRowAuth, listRowsAuth, updateRowAuth } from "../../lib/supabase";
import type { AIPrompt } from "../../types";
import type { DashboardContext } from "./DashboardLayout";

// ── Tipos del wizard ──────────────────────────────────────────────────────────

interface TrainingData {
  agentName: string;
  tone: string;
  objective: string;
  bizDescription: string;
  products: string;
  schedule: string;
  location: string;
  faq: string;
  policies: string;
  forbidden: string;
  escalation: string;
}

const EMPTY_TRAINING: TrainingData = {
  agentName: "",
  tone: "amigable",
  objective: "ventas",
  bizDescription: "",
  products: "",
  schedule: "",
  location: "",
  faq: "",
  policies: "",
  forbidden: "",
  escalation: "",
};

const TONES = ["amigable", "profesional", "directo", "formal", "casual", "empático"];
const OBJECTIVES = ["ventas", "soporte", "reservas", "información", "pedidos", "leads"];

// ── Llamada a Claude API para generar el prompt ───────────────────────────────

async function generarPromptConIA(
  clientName: string,
  bizType: string,
  data: TrainingData,
  apiKey: string,
): Promise<string> {
  const metaPrompt = `Sos un experto en prompt engineering para agentes de WhatsApp con IA.
Tu tarea es crear un system prompt COMPLETO, DETALLADO y MUY ESPECÍFICO para un agente de WhatsApp.

El system prompt que generes debe hacer que el agente parezca un empleado real del negocio que conoce TODO sobre la empresa.

Datos del negocio:
- Nombre del negocio: ${clientName}
- Tipo de negocio: ${bizType || "no especificado"}
- Nombre del agente: ${data.agentName || "el asistente"}
- Tono: ${data.tone}
- Objetivo principal: ${data.objective}

Descripción del negocio:
${data.bizDescription || "No especificada"}

Productos / Servicios (con precios si aplica):
${data.products || "No especificados"}

Horarios de atención:
${data.schedule || "No especificado"}

Ubicación / Contacto:
${data.location || "No especificado"}

Preguntas frecuentes:
${data.faq || "No especificadas"}

Políticas (devoluciones, garantías, envíos, etc.):
${data.policies || "No especificadas"}

Frases o temas que NUNCA debe mencionar:
${data.forbidden || "Ninguna restricción especificada"}

Cuándo y cómo escalar a una persona real:
${data.escalation || "No especificado"}

---

Generá un system prompt en español argentino (usando "vos", "podés", "tenés") con estas secciones:

## Tu identidad
## Sobre el negocio
## Productos y servicios
## Horarios y ubicación
## Preguntas frecuentes
## Políticas
## Reglas de comportamiento
## Cuándo escalar

El system prompt debe:
- Usar toda la información proporcionada, sin inventar nada
- Ser muy específico y detallado (no genérico)
- Incluir ejemplos de cómo responder según el tono elegido
- Tener instrucciones claras para cada situación
- Terminar siempre con una acción o pregunta al cliente

Devolvé SOLO el system prompt, sin explicaciones previas ni comentarios.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: metaPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Error ${res.status}`);
  }

  const data2 = await res.json() as { content: Array<{ text: string }> };
  return data2.content[0]?.text ?? "";
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function BotPage() {
  const { selectedClientId, clients } = useOutletContext<DashboardContext>();
  const { token } = useAuth();
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Prompt guardado en Supabase
  const [prompt, setPrompt] = useState<AIPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Campos del prompt
  const [bizType, setBizType] = useState("");
  const [sysPrompt, setSysPrompt] = useState("");

  // Wizard de entrenamiento
  const [wizardOpen, setWizardOpen] = useState(false);
  const [training, setTraining] = useState<TrainingData>(EMPTY_TRAINING);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("riweb_anthropic_key") ?? "");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Cargar prompt existente
  useEffect(() => {
    if (!selectedClientId || !token) { setPrompt(null); return; }
    setLoading(true);
    setSaveError("");
    listRowsAuth<AIPrompt>(
      "ai_prompts", token,
      `select=*&client_id=eq.${selectedClientId}&active=eq.true&limit=1`,
    )
      .then((data) => {
        const p = data[0] ?? null;
        setPrompt(p);
        if (p) {
          setBizType(p.business_type ?? "");
          setTraining((prev) => ({
            ...prev,
            tone: p.tone,
            objective: p.objective ?? "ventas",
          }));
          setSysPrompt(p.system_prompt ?? "");
        } else {
          setBizType(selectedClient?.business_type ?? "");
          setTraining(EMPTY_TRAINING);
          setSysPrompt("");
        }
        // Cargar datos del wizard desde localStorage si existen
        const saved = localStorage.getItem(`riweb_training_${selectedClientId}`);
        if (saved) setTraining(JSON.parse(saved) as TrainingData);
      })
      .catch((err: Error) => setSaveError(err.message))
      .finally(() => setLoading(false));
  }, [selectedClientId, token]);

  // Guardar datos del wizard en localStorage al cambiar
  const setField = (field: keyof TrainingData, value: string) => {
    setTraining((prev) => {
      const next = { ...prev, [field]: value };
      if (selectedClientId) {
        localStorage.setItem(`riweb_training_${selectedClientId}`, JSON.stringify(next));
      }
      return next;
    });
  };

  // Generar prompt con IA
  const handleGenerate = async () => {
    if (!apiKey.trim()) { setShowKeyInput(true); return; }
    if (!selectedClient) return;
    setGenerating(true);
    setGenError("");
    try {
      const generated = await generarPromptConIA(
        selectedClient.name,
        bizType,
        training,
        apiKey,
      );
      setSysPrompt(generated);
      setWizardOpen(false);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Error al generar");
    } finally {
      setGenerating(false);
    }
  };

  // Guardar en Supabase
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClientId) return;
    setSaving(true);
    setSaveError("");
    setSuccess(false);
    const payload = {
      client_id: selectedClientId,
      system_prompt: sysPrompt,
      tone: training.tone,
      business_type: bizType || null,
      objective: training.objective,
      active: true,
      updated_at: new Date().toISOString(),
    };
    try {
      if (prompt?.id) {
        await updateRowAuth<AIPrompt>("ai_prompts", prompt.id, payload, token);
      } else {
        const created = await insertRowAuth("ai_prompts", payload, token);
        setPrompt({ ...payload, id: (created as { id: string }).id, created_at: new Date().toISOString() } as AIPrompt);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🤖</div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.5rem" }}>Seleccioná un cliente</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: 0 }}>
          Usá el selector del header para ver y configurar el bot de un cliente.
        </p>
      </div>
    );
  }

  const webhookUrl = selectedClient?.hosting_url
    ? `${selectedClient.hosting_url.replace(/\/$/, "")}/webhook`
    : null;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Bot / Entrenamiento</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.25rem 0 0" }}>
          Agente IA para{" "}
          <strong style={{ color: "var(--text-main)" }}>{selectedClient?.name}</strong>
        </p>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Cargando configuración...</div>
      ) : (
        <>
          {/* ── Config técnica ────────────────────────────────────── */}
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.85rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.72rem" }}>
              Configuración técnica
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: "0.75rem" }}>
              <ConfigRow label="CLIENT_ID" value={selectedClientId} mono />
              <ConfigRow label="WhatsApp" value={selectedClient?.whatsapp ?? null} />
              <ConfigRow label="Railway URL" value={selectedClient?.hosting_url ?? null} link />
              <ConfigRow label="Webhook URL" value={webhookUrl} mono link />
            </div>
            {!selectedClient?.hosting_url && (
              <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "var(--text-muted)", background: "rgba(202,138,4,0.06)", border: "1px solid rgba(202,138,4,0.2)", borderRadius: "8px", padding: "0.6rem 0.85rem" }}>
                ⚠️ Completá la <strong>Railway URL</strong> en Suscripciones para ver la URL del webhook.
              </div>
            )}
          </div>

          {/* ── Panel de entrenamiento ─────────────────────────────── */}
          <div className="admin-card" style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", userSelect: "none",
              }}
              onClick={() => setWizardOpen((v) => !v)}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  ✨ Entrenamiento del agente
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                  Completá los datos del negocio y generá el prompt con IA
                </div>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
                {wizardOpen ? "▲" : "▼"}
              </span>
            </div>

            {wizardOpen && (
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>

                {/* Identidad */}
                <SectionTitle>Identidad del agente</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                  <Field label="Nombre del agente">
                    <input
                      value={training.agentName}
                      onChange={(e) => setField("agentName", e.target.value)}
                      placeholder='Ej: "Ana", "Soporte TuEmpresa"'
                    />
                  </Field>
                  <Field label="Tipo de negocio">
                    <input
                      value={bizType}
                      onChange={(e) => setBizType(e.target.value)}
                      placeholder="Ej: vidriería, electrónica, restaurante"
                    />
                  </Field>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <Field label="Tono">
                    <select
                      className="admin-select" style={{ width: "100%" }}
                      value={training.tone}
                      onChange={(e) => setField("tone", e.target.value)}
                    >
                      {TONES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Objetivo principal">
                    <select
                      className="admin-select" style={{ width: "100%" }}
                      value={training.objective}
                      onChange={(e) => setField("objective", e.target.value)}
                    >
                      {OBJECTIVES.map((o) => (
                        <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* El negocio */}
                <SectionTitle>El negocio</SectionTitle>
                <Field label="Descripción detallada (qué venden, a quién, qué los diferencia)" style={{ marginBottom: "0.75rem" }}>
                  <textarea
                    className="admin-textarea" rows={4}
                    value={training.bizDescription}
                    onChange={(e) => setField("bizDescription", e.target.value)}
                    placeholder="Ej: Somos una vidriería en Buenos Aires especializada en vidrios templados para locales comerciales y hogares. Trabajamos con vidrio flotado, laminado y templado. Nuestros clientes son principalmente arquitectos, constructoras y particulares..."
                  />
                </Field>
                <Field label="Productos / Servicios con precios (uno por línea)" style={{ marginBottom: "0.75rem" }}>
                  <textarea
                    className="admin-textarea" rows={4}
                    value={training.products}
                    onChange={(e) => setField("products", e.target.value)}
                    placeholder={"Vidrio templado 6mm — desde $15.000 m²\nEspejo biselado — desde $22.000 m²\nInstalación de ventanas — consultar por medida\nMamparas de baño — desde $85.000"}
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <Field label="Horarios de atención">
                    <textarea
                      className="admin-textarea" rows={3}
                      value={training.schedule}
                      onChange={(e) => setField("schedule", e.target.value)}
                      placeholder={"Lunes a viernes: 9:00 a 18:00\nSábados: 9:00 a 13:00\nDomingos: cerrado"}
                    />
                  </Field>
                  <Field label="Ubicación / Contacto / Web">
                    <textarea
                      className="admin-textarea" rows={3}
                      value={training.location}
                      onChange={(e) => setField("location", e.target.value)}
                      placeholder={"Av. Corrientes 1234, CABA\nTel: 011-1234-5678\nweb: miempresa.com.ar\nEmail: info@miempresa.com"}
                    />
                  </Field>
                </div>

                {/* Conocimiento */}
                <SectionTitle>Conocimiento y reglas</SectionTitle>
                <Field label="Preguntas frecuentes (escribí pregunta y respuesta)" style={{ marginBottom: "0.75rem" }}>
                  <textarea
                    className="admin-textarea" rows={5}
                    value={training.faq}
                    onChange={(e) => setField("faq", e.target.value)}
                    placeholder={"¿Hacen instalación? → Sí, contamos con instaladores propios. El costo depende de la distancia y complejidad.\n¿Tienen garantía? → 1 año en mano de obra y garantía del fabricante en materiales.\n¿Hacen presupuesto a domicilio? → Sí, sin cargo en CABA y GBA."}
                  />
                </Field>
                <Field label="Políticas (devoluciones, garantías, formas de pago)" style={{ marginBottom: "0.75rem" }}>
                  <textarea
                    className="admin-textarea" rows={3}
                    value={training.policies}
                    onChange={(e) => setField("policies", e.target.value)}
                    placeholder={"Formas de pago: efectivo, transferencia, mercado pago (sin interés en 3 cuotas)\nNo se aceptan devoluciones en vidrios cortados a medida\nGarantía de instalación: 6 meses"}
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  <Field label="Temas que NUNCA debe mencionar">
                    <textarea
                      className="admin-textarea" rows={3}
                      value={training.forbidden}
                      onChange={(e) => setField("forbidden", e.target.value)}
                      placeholder={"No mencionar competidores\nNo dar precios de materiales sin consultar\nNo confirmar fechas de entrega sin verificar stock"}
                    />
                  </Field>
                  <Field label="Cuándo y cómo escalar a una persona">
                    <textarea
                      className="admin-textarea" rows={3}
                      value={training.escalation}
                      onChange={(e) => setField("escalation", e.target.value)}
                      placeholder={"Si el cliente quiere hablar con alguien → 'Nuestro equipo se comunica a la brevedad. ¿Cuál es tu nombre y el mejor horario?'\nReclamos → derivar al email reclamos@miempresa.com\nPedidos grandes (+50m²) → solicitar datos para pasar a ventas"}
                    />
                  </Field>
                </div>

                {/* API Key + Generar */}
                <div style={{
                  background: "rgba(202,138,4,0.06)", border: "1px solid rgba(202,138,4,0.2)",
                  borderRadius: "10px", padding: "1rem",
                }}>
                  {(showKeyInput || !apiKey) && (
                    <Field label="Anthropic API Key (se guarda en tu navegador)" style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-ant-..."
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem("riweb_anthropic_key", apiKey);
                            setShowKeyInput(false);
                          }}
                          style={{
                            background: "rgba(202,138,4,0.15)", border: "1px solid rgba(202,138,4,0.35)",
                            borderRadius: "8px", padding: "0 0.85rem", color: "#f59e0b",
                            cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap",
                          }}
                        >
                          Guardar key
                        </button>
                      </div>
                    </Field>
                  )}

                  {genError && (
                    <div style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                      Error: {genError}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating}
                      className="btn-primary"
                      style={{ fontSize: "0.9rem", padding: "0.55rem 1.4rem" }}
                    >
                      {generating ? "Generando prompt..." : "✨ Generar prompt con IA"}
                    </button>
                    {apiKey && !showKeyInput && (
                      <button
                        type="button"
                        onClick={() => setShowKeyInput(true)}
                        style={{
                          background: "none", border: "none", color: "var(--text-muted)",
                          cursor: "pointer", fontSize: "0.75rem", padding: 0,
                        }}
                      >
                        Cambiar API key
                      </button>
                    )}
                    {generating && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        Claude está analizando el negocio y generando el prompt...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── System prompt generado / manual ───────────────────── */}
          <form onSubmit={handleSave}>
            <div className="admin-card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>System prompt activo</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                    Lo que el bot "sabe" y cómo se comporta — editable manualmente
                  </div>
                </div>
                {sysPrompt && (
                  <span style={{
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                    color: "#4ade80", borderRadius: "999px", fontSize: "0.7rem",
                    fontWeight: 700, padding: "0.15rem 0.6rem",
                  }}>
                    ● Activo
                  </span>
                )}
              </div>
              <textarea
                className="admin-textarea"
                style={{ width: "100%" }}
                rows={16}
                value={sysPrompt}
                onChange={(e) => setSysPrompt(e.target.value)}
                placeholder={`El prompt del agente aparece aquí después de generarlo con IA, o podés escribirlo manualmente.\n\nTip: usá el panel "Entrenamiento del agente" arriba para generar uno completo y personalizado.`}
              />
              <div style={{ textAlign: "right", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                {sysPrompt.length.toLocaleString()} caracteres
              </div>
            </div>

            {saveError && (
              <div style={{
                padding: "0.65rem 0.9rem", borderRadius: "8px", marginBottom: "1rem",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171", fontSize: "0.85rem",
              }}>
                {saveError}
              </div>
            )}
            {success && (
              <div style={{
                padding: "0.65rem 0.9rem", borderRadius: "8px", marginBottom: "1rem",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                color: "#4ade80", fontSize: "0.85rem",
              }}>
                ✓ Prompt guardado — el bot ya usa la nueva configuración
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={saving || !sysPrompt}>
              {saving ? "Guardando..." : "💾 Guardar prompt"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: "#f59e0b",
      marginBottom: "0.65rem",
    }}>
      {children}
    </div>
  );
}

function Field({
  label, children, style,
}: {
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="admin-form-group" style={style}>
      <label className="admin-form-label">{label}</label>
      {children}
    </div>
  );
}

function ConfigRow({ label, value, mono, link }: { label: string; value: string | null; mono?: boolean; link?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem", fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {value ? (
          <>
            {link ? (
              <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem", color: "#f59e0b", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all", textDecoration: "none" }}>
                {value}
              </a>
            ) : (
              <span style={{ fontSize: "0.78rem", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all", color: "var(--text-main)" }}>
                {value}
              </span>
            )}
            <button onClick={copy} title="Copiar" style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#4ade80" : "var(--text-muted)", fontSize: "0.85rem", padding: "0 0.1rem", flexShrink: 0 }}>
              {copied ? "✓" : "📋"}
            </button>
          </>
        ) : (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>—</span>
        )}
      </div>
    </div>
  );
}

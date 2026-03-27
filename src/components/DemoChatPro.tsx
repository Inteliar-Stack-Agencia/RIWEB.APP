import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "../types";

type Msg = { from: "bot" | "user"; text: string };
type Phase = "setup" | "chat";
type GroqMsg = { role: "system" | "user" | "assistant"; content: string };

const WA_NUMBER = "5491165689145";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string;
const GROQ_MODEL = (import.meta.env.VITE_GROQ_MODEL as string) || "llama-3.3-70b-versatile";
const GROQ_BASE_URL = import.meta.env.VITE_GROQ_BASE_URL as string ?? "https://api.groq.com/openai/v1";

const EXAMPLES_ES = [
  { label: "Restaurante" },
  { label: "Tienda de ropa" },
  { label: "Servicio técnico" },
];
const EXAMPLES_EN = [
  { label: "Restaurant" },
  { label: "Clothing store" },
  { label: "Tech repair" },
];

function buildSystemPrompt(business: string, lang: "es" | "en"): string {
  if (lang === "es") {
    return `Sos un asistente de ventas IA para un negocio de tipo: "${business}".
Respondé siempre en español argentino (usá "vos", "podés", "tenés").
Tu objetivo: responder consultas, dar información y ayudar a cerrar ventas.
Sé amigable y muy conciso (máximo 2 oraciones cortas). Usá 1 emoji por respuesta.
Si no sabés detalles específicos del negocio, inventá datos plausibles y realistas.
No menciones que sos IA ni un bot. Terminá siempre con una pregunta breve para mantener la conversación.`;
  }
  return `You are an AI sales assistant for a "${business}" business.
Always reply in English.
Your goal: answer questions, provide info and help close sales.
Be friendly and very concise (max 2 short sentences). Use 1 emoji per reply.
If you don't know specific details, invent plausible realistic ones.
Don't mention you're an AI or a bot. Always end with a brief question to keep the conversation going.`;
}

async function callGroq(messages: GroqMsg[]): Promise<string> {
  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 120,
      temperature: 0.75,
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return (data.choices[0].message.content as string).trim();
}

export default function DemoChatPro({ locale }: { locale: Locale }) {
  const lang = locale;
  const [phase, setPhase] = useState<Phase>("setup");
  const [businessInput, setBusinessInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [business, setBusiness] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GroqMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const examples = lang === "es" ? EXAMPLES_ES : EXAMPLES_EN;

  // Scroll within the chat container only (not the page)
  useEffect(() => {
    if (msgs.length === 0) return;
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const startDemo = async (value?: string) => {
    const biz = (value ?? businessInput).trim();
    if (!biz || loading) return;

    setBusiness(biz);
    setLoading(true);
    setMsgs([]);

    const systemPrompt = buildSystemPrompt(biz, lang);
    const initHistory: GroqMsg[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: lang === "es" ? "Hola" : "Hi" },
    ];

    try {
      const reply = await callGroq(initHistory);
      const fullHistory: GroqMsg[] = [...initHistory, { role: "assistant", content: reply }];
      setHistory(fullHistory);
      setMsgs([{ from: "bot", text: reply }]);
      setPhase("chat");
    } catch {
      setMsgs([{
        from: "bot",
        text: lang === "es"
          ? "Error al conectar. Intentá de nuevo."
          : "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || typing) return;

    setChatInput("");
    setMsgs((prev) => [...prev, { from: "user", text }]);

    const newHistory: GroqMsg[] = [...history, { role: "user", content: text }];
    setTyping(true);

    try {
      const reply = await callGroq(newHistory);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMsgs((prev) => [...prev, { from: "bot", text: reply }]);
    } catch {
      setMsgs((prev) => [...prev, {
        from: "bot",
        text: lang === "es" ? "Error al responder. Intentá de nuevo." : "Error. Try again.",
      }]);
    } finally {
      setTyping(false);
    }
  };

  const reset = () => {
    setPhase("setup");
    setBusiness("");
    setBusinessInput("");
    setChatInput("");
    setMsgs([]);
    setHistory([]);
    setTyping(false);
    setLoading(false);
  };

  const waLink = useMemo(() => {
    const biz = business || businessInput;
    const msg = lang === "es"
      ? `Hola, tengo un negocio de "${biz}" y quiero mi bot de ventas`
      : `Hi, I have a "${biz}" business and I want my sales bot`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [business, businessInput, lang]);

  return (
    <div id="demo" style={{ maxWidth: 560, margin: "0 auto", scrollMarginTop: "5rem" }}>

      {/* ── Phase 1: business type input ─────────────────────────────── */}
      {phase === "setup" && (
        <div style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(202,138,4,0.25)",
          borderRadius: "16px",
          padding: "1rem 1.25rem",
          backdropFilter: "blur(8px)",
          marginBottom: "0.75rem",
        }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={businessInput}
              onChange={(e) => setBusinessInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startDemo()}
              placeholder={lang === "es" ? "¿Qué vendés? Ej: ropa, restaurante..." : "What do you sell? E.g. pizza, clothes..."}
              style={{ flex: 1, minWidth: 0 }}
              disabled={loading}
            />
            <button
              onClick={() => startDemo()}
              disabled={!businessInput.trim() || loading}
              className="btn-primary"
              style={{
                opacity: businessInput.trim() && !loading ? 1 : 0.5,
                cursor: businessInput.trim() && !loading ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "..." : (lang === "es" ? "Probar" : "Try")}
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {lang === "es" ? "Probar con:" : "Try with:"}
            </span>
            {examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => { setBusinessInput(ex.label); startDemo(ex.label); }}
                disabled={loading}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(202,138,4,0.4)",
                  background: "rgba(202,138,4,0.08)",
                  color: "var(--primary)",
                  fontSize: "0.78rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "background 0.2s",
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat window ───────────────────────────────────────────────── */}
      <div style={{
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(202,138,4,0.25)",
        borderRadius: "16px",
        padding: "1rem",
        backdropFilter: "blur(8px)",
        minHeight: "220px",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Bot header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          paddingBottom: "0.75rem",
          marginBottom: "0.75rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg,#ca8a04,#f59e0b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", flexShrink: 0,
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>AI Sales Bot</div>
            <div style={{ fontSize: "0.7rem", color: "#34d399" }}>
              {phase === "chat"
                ? (lang === "es" ? `● Activo para: ${business}` : `● Active for: ${business}`)
                : (lang === "es" ? "● Listo para activar" : "● Ready to activate")}
            </div>
          </div>
          {phase === "chat" && (
            <button onClick={reset} style={{
              marginLeft: "auto", background: "none", border: "none",
              color: "var(--text-muted)", cursor: "pointer",
              fontSize: "0.75rem", textDecoration: "underline",
            }}>
              {lang === "es" ? "Reiniciar" : "Reset"}
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ fontSize: "0.82rem", color: "rgba(202,138,4,0.8)", animation: "pulse 1.5s ease-in-out infinite" }}>
            {lang === "es" ? "⚡ Generando tu asistente IA..." : "⚡ Generating your AI assistant..."}
          </div>
        )}

        {/* Empty state */}
        {!loading && phase === "setup" && msgs.length === 0 && (
          <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {lang === "es"
              ? <span>Escribí qué vendés y apretá <strong style={{ color: "var(--primary)" }}>Probar</strong> 👆</span>
              : <span>Type what you sell and hit <strong style={{ color: "var(--primary)" }}>Try</strong> 👆</span>}
          </div>
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, overflowY: "auto", maxHeight: 300 }}>
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                animation: "terminalFadeIn 0.3s ease-out",
              }}
            >
              <div style={{
                maxWidth: "82%",
                padding: "0.6rem 0.9rem",
                borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.from === "user"
                  ? "linear-gradient(135deg,#ca8a04,#d97706)"
                  : "rgba(255,255,255,0.07)",
                color: m.from === "user" ? "#0F172A" : "var(--text-muted)",
                fontSize: "0.86rem",
                fontWeight: m.from === "user" ? 500 : 400,
                lineHeight: 1.45,
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                padding: "0.6rem 1rem",
                borderRadius: "14px 14px 14px 4px",
                background: "rgba(202,138,4,0.12)",
                color: "rgba(202,138,4,0.7)",
                fontSize: "0.86rem",
                animation: "pulse 1.2s ease-in-out infinite",
              }}>
                {lang === "es" ? "escribiendo..." : "typing..."}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Phase 2: chat input ───────────────────────────────────── */}
        {phase === "chat" && (
          <div style={{
            marginTop: "0.75rem",
            display: "flex",
            gap: "0.5rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "0.75rem",
          }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={lang === "es" ? "Escribí tu consulta..." : "Type your question..."}
              style={{ flex: 1, minWidth: 0 }}
              disabled={typing}
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim() || typing}
              className="btn-primary"
              style={{
                opacity: chatInput.trim() && !typing ? 1 : 0.5,
                cursor: chatInput.trim() && !typing ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              {lang === "es" ? "Enviar" : "Send"}
            </button>
          </div>
        )}
      </div>

      {/* CTA — aparece luego de 3+ mensajes */}
      {phase === "chat" && msgs.length >= 3 && (
        <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "center" }}>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            {lang === "es" ? "👉 Quiero este bot para mi negocio" : "👉 I want this bot for my business"}
          </a>
        </div>
      )}
    </div>
  );
}

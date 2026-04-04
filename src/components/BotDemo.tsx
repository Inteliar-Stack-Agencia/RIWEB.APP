import { useState, useEffect, useRef, useMemo } from "react";
import type { Locale } from "../types";
import { WHATSAPP_PHONE } from "./WhatsAppButton";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1";

const QUICK_EXAMPLES_ES = [
  { label: "Restaurante" },
  { label: "Tienda de ropa" },
  { label: "Servicio técnico" },
];

const QUICK_EXAMPLES_EN = [
  { label: "Restaurant" },
  { label: "Clothing store" },
  { label: "Tech repair" },
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildSystemPrompt(businessType: string, locale: Locale): string {
  return locale === "es"
    ? `Sos un asistente de ventas IA para un negocio de tipo: "${businessType}".
Respondé siempre en español argentino (usá "vos", "podés", "tenés").
Tu objetivo: responder consultas, dar información y ayudar a cerrar ventas.
Sé amigable y muy conciso (máximo 2 oraciones cortas). Usá 1 emoji por respuesta.
Si no sabés detalles específicos del negocio, inventá datos plausibles y realistas.
No menciones que sos IA ni un bot. Terminá siempre con una pregunta breve para mantener la conversación.`
    : `You are an AI sales assistant for a "${businessType}" business.
Always reply in English.
Your goal: answer questions, provide info and help close sales.
Be friendly and very concise (max 2 short sentences). Use 1 emoji per reply.
If you don't know specific details, invent plausible realistic ones.
Don't mention you're an AI or a bot. Always end with a brief question to keep the conversation going.`;
}

async function callGroq(messages: ChatMessage[]): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("Missing VITE_GROQ_API_KEY");
  const res = await fetch(`${GROQ_URL}/chat/completions`, {
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
  return (await res.json()).choices[0].message.content.trim();
}

export default function BotDemo({ locale }: { locale: Locale }) {
  const [mode, setMode] = useState<"setup" | "chat">("setup");
  const [businessInput, setBusinessInput] = useState("");
  const [currentMsg, setCurrentMsg] = useState("");
  const [activeBusiness, setActiveBusiness] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const examples = locale === "es" ? QUICK_EXAMPLES_ES : QUICK_EXAMPLES_EN;

  useEffect(() => {
    if (messages.length === 0) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const initDemo = async (override?: string) => {
    const biz = (override ?? businessInput).trim();
    if (!biz || initializing) return;
    setActiveBusiness(biz);
    setInitializing(true);
    setMessages([]);

    const initMessages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt(biz, locale) },
      { role: "user", content: locale === "es" ? "Hola" : "Hi" },
    ];

    try {
      const reply = await callGroq(initMessages);
      const fullHistory = [...initMessages, { role: "assistant" as const, content: reply }];
      setHistory(fullHistory);
      setMessages([{ from: "bot", text: reply }]);
      setMode("chat");
    } catch {
      setMessages([{
        from: "bot",
        text: locale === "es" ? "Error al conectar. Intentá de nuevo." : "Connection error. Please try again.",
      }]);
    } finally {
      setInitializing(false);
    }
  };

  const sendMessage = async () => {
    const msg = currentMsg.trim();
    if (!msg || loading) return;
    setCurrentMsg("");
    setMessages((prev) => [...prev, { from: "user", text: msg }]);

    const newHistory: ChatMessage[] = [...history, { role: "user", content: msg }];
    setLoading(true);

    try {
      const reply = await callGroq(newHistory);
      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: locale === "es" ? "Error al responder. Intentá de nuevo." : "Error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMode("setup");
    setActiveBusiness("");
    setBusinessInput("");
    setCurrentMsg("");
    setMessages([]);
    setHistory([]);
    setLoading(false);
    setInitializing(false);
  };

  const whatsappLink = useMemo(() => {
    const biz = activeBusiness || businessInput;
    const text =
      locale === "es"
        ? `Hola, tengo un negocio de "${biz}" y quiero mi bot de ventas`
        : `Hi, I have a "${biz}" business and I want my sales bot`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  }, [activeBusiness, businessInput, locale]);

  return (
    <div id="demo" style={{ maxWidth: 560, margin: "0 auto", scrollMarginTop: "5rem" }}>
      {/* Setup input */}
      {mode === "setup" && (
        <div
          style={{
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(202,138,4,0.25)",
            borderRadius: "16px",
            padding: "1rem 1.25rem",
            backdropFilter: "blur(8px)",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={businessInput}
              onChange={(e) => setBusinessInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && initDemo()}
              placeholder={
                locale === "es"
                  ? "¿Qué vendés? Ej: ropa, restaurante..."
                  : "What do you sell? E.g. pizza, clothes..."
              }
              style={{ flex: 1, minWidth: 0 }}
              disabled={initializing}
            />
            <button
              onClick={() => initDemo()}
              disabled={!businessInput.trim() || initializing}
              className="btn-primary"
              style={{
                opacity: businessInput.trim() && !initializing ? 1 : 0.5,
                cursor: businessInput.trim() && !initializing ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              {initializing ? "..." : locale === "es" ? "Probar" : "Try"}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginTop: "0.75rem",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              {locale === "es" ? "Probar con:" : "Try with:"}
            </span>
            {examples.map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  setBusinessInput(ex.label);
                  initDemo(ex.label);
                }}
                disabled={initializing}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "999px",
                  border: "1px solid rgba(202,138,4,0.4)",
                  background: "rgba(202,138,4,0.08)",
                  color: "var(--primary)",
                  fontSize: "0.78rem",
                  cursor: initializing ? "not-allowed" : "pointer",
                  opacity: initializing ? 0.5 : 1,
                  transition: "background 0.2s",
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div
        style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(202,138,4,0.25)",
          borderRadius: "16px",
          padding: "1rem",
          backdropFilter: "blur(8px)",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            paddingBottom: "0.75rem",
            marginBottom: "0.75rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#ca8a04,#f59e0b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>AI Sales Bot</div>
            <div style={{ fontSize: "0.7rem", color: "#34d399" }}>
              {mode === "chat"
                ? locale === "es"
                  ? `● Activo para: ${activeBusiness}`
                  : `● Active for: ${activeBusiness}`
                : locale === "es"
                  ? "● Listo para activar"
                  : "● Ready to activate"}
            </div>
          </div>
          {mode === "chat" && (
            <button
              onClick={reset}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.75rem",
                textDecoration: "underline",
              }}
            >
              {locale === "es" ? "Reiniciar" : "Reset"}
            </button>
          )}
        </div>

        {/* Initializing state */}
        {initializing && (
          <div
            style={{
              fontSize: "0.82rem",
              color: "rgba(202,138,4,0.8)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            {locale === "es" ? "⚡ Generando tu asistente IA..." : "⚡ Generating your AI assistant..."}
          </div>
        )}

        {/* Empty state */}
        {!initializing && mode === "setup" && messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "1.5rem 0",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            {locale === "es" ? (
              <span>
                Escribí qué vendés y apretá{" "}
                <strong style={{ color: "var(--primary)" }}>Probar</strong> 👆
              </span>
            ) : (
              <span>
                Type what you sell and hit{" "}
                <strong style={{ color: "var(--primary)" }}>Try</strong> 👆
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            flex: 1,
            overflowY: "auto",
            maxHeight: 300,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                animation: "terminalFadeIn 0.3s ease-out",
              }}
            >
              <div
                style={{
                  maxWidth: "82%",
                  padding: "0.6rem 0.9rem",
                  borderRadius:
                    m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background:
                    m.from === "user"
                      ? "linear-gradient(135deg,#ca8a04,#d97706)"
                      : "rgba(255,255,255,0.07)",
                  color: m.from === "user" ? "#0F172A" : "var(--text-muted)",
                  fontSize: "0.86rem",
                  fontWeight: m.from === "user" ? 500 : 400,
                  lineHeight: 1.45,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "14px 14px 14px 4px",
                  background: "rgba(202,138,4,0.12)",
                  color: "rgba(202,138,4,0.7)",
                  fontSize: "0.86rem",
                  animation: "pulse 1.2s ease-in-out infinite",
                }}
              >
                {locale === "es" ? "escribiendo..." : "typing..."}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Chat input */}
        {mode === "chat" && (
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              gap: "0.5rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "0.75rem",
            }}
          >
            <input
              value={currentMsg}
              onChange={(e) => setCurrentMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={locale === "es" ? "Escribí tu consulta..." : "Type your question..."}
              style={{ flex: 1, minWidth: 0 }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!currentMsg.trim() || loading}
              className="btn-primary"
              style={{
                opacity: currentMsg.trim() && !loading ? 1 : 0.5,
                cursor: currentMsg.trim() && !loading ? "pointer" : "not-allowed",
                whiteSpace: "nowrap",
              }}
            >
              {locale === "es" ? "Enviar" : "Send"}
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp CTA after 3+ messages */}
      {mode === "chat" && messages.length >= 3 && (
        <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "center" }}>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            {locale === "es"
              ? "👉 Quiero este bot para mi negocio"
              : "👉 I want this bot for my business"}
          </a>
        </div>
      )}
    </div>
  );
}

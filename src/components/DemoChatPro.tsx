import { useMemo, useState } from "react";
import type { Locale } from "../types";

type Msg = { from: "bot" | "user"; text: string };

const WA_NUMBER = "5491165689145";

const EXAMPLES_ES = [
  { label: "Restaurante", value: "Restaurante" },
  { label: "Tienda de ropa", value: "Tienda de ropa" },
  { label: "Servicio técnico", value: "Servicio técnico" },
];
const EXAMPLES_EN = [
  { label: "Restaurant", value: "Restaurant" },
  { label: "Clothing store", value: "Clothing store" },
  { label: "Tech repair", value: "Tech repair" },
];

function detectCategory(input: string) {
  const t = input.toLowerCase();
  if (/rest|pizza|comida|food|cafe|sushi|burger|menu|restaur/.test(t)) return "restaurant";
  if (/ropa|cloth|fashion|moda|shirt|dress|boutique|indument|zapat/.test(t)) return "clothing";
  if (/repar|service|fix|técn|tech|celular|laptop|pantalla|screen/.test(t)) return "repair";
  return "generic";
}

// Full back-and-forth conversations: alternating bot / simulated-customer
function getConversation(input: string, lang: "es" | "en"): Msg[] {
  const cat = detectCategory(input);

  if (lang === "es") {
    if (cat === "restaurant") return [
      { from: "bot",  text: "Hola 👋 ¿Buscás el menú del día o querés reservar una mesa?" },
      { from: "user", text: "Quiero ver el menú" },
      { from: "bot",  text: "Hoy tenemos pizza, milanesa y ensalada 🍕 Todo desde $1.200. ¿Te anoto algo?" },
      { from: "user", text: "Sí, una pizza para llevar" },
      { from: "bot",  text: "¡Listo! ¿Cuándo pasás a buscarla? Puedo reservarla ahora mismo 🚀" },
    ];
    if (cat === "clothing") return [
      { from: "bot",  text: "Hola 👋 ¿Buscás algo casual, deportivo o formal?" },
      { from: "user", text: "Casual, ¿tenés remeras?" },
      { from: "bot",  text: "Sí! Remeras desde $4.500, varios colores 🔥 ¿Qué talle usás?" },
      { from: "user", text: "Talle M, ¿cuánto tarda el envío?" },
      { from: "bot",  text: "Envío en 24hs. Comprás hoy, llegás mañana 📦 ¿Te mando el link de pago?" },
    ];
    if (cat === "repair") return [
      { from: "bot",  text: "Hola 👋 ¿Qué equipo necesitás reparar?" },
      { from: "user", text: "El celular, se me rajó la pantalla" },
      { from: "bot",  text: "¿Qué modelo es? Así te doy el precio exacto al toque 📲" },
      { from: "user", text: "iPhone 13" },
      { from: "bot",  text: "iPhone 13: cambio de pantalla $25.000, listo en 2hs. ¿Tenés turno libre hoy?" },
    ];
    return [
      { from: "bot",  text: "Hola 👋 ¿En qué te puedo ayudar?" },
      { from: "user", text: "Quiero saber más sobre sus servicios" },
      { from: "bot",  text: "Con gusto 😊 ¿Buscás algo específico o querés que te cuente las opciones?" },
      { from: "user", text: "¿Cuánto cuesta?" },
      { from: "bot",  text: "Depende de lo que necesitás. Contame un poco más y te doy precio exacto en segundos ⚡" },
    ];
  } else {
    if (cat === "restaurant") return [
      { from: "bot",  text: "Hi 👋 Looking for today's menu or want to book a table?" },
      { from: "user", text: "I'd like to see the menu" },
      { from: "bot",  text: "Today we have pizza, chicken & salads 🍕 From $12. Want to order something?" },
      { from: "user", text: "Yes, a pizza to go" },
      { from: "bot",  text: "Done! When can you pick it up? I can reserve it right now 🚀" },
    ];
    if (cat === "clothing") return [
      { from: "bot",  text: "Hi 👋 Looking for casual, sport or formal?" },
      { from: "user", text: "Casual — do you have t-shirts?" },
      { from: "bot",  text: "Yes! T-shirts from $15, multiple colors 🔥 What size are you?" },
      { from: "user", text: "Size M — how long does shipping take?" },
      { from: "bot",  text: "Ships in 24hs. Order today, get it tomorrow 📦 Want me to send the checkout link?" },
    ];
    if (cat === "repair") return [
      { from: "bot",  text: "Hi 👋 What device do you need fixed?" },
      { from: "user", text: "My phone screen cracked" },
      { from: "bot",  text: "Which model? I'll give you the exact price right away 📲" },
      { from: "user", text: "iPhone 13" },
      { from: "bot",  text: "iPhone 13 screen repair: $89, ready in 2hs. Do you have time today?" },
    ];
    return [
      { from: "bot",  text: "Hi 👋 How can I help you?" },
      { from: "user", text: "I'd like to know about your services" },
      { from: "bot",  text: "Happy to help 😊 Looking for something specific or want me to walk you through?" },
      { from: "user", text: "How much does it cost?" },
      { from: "bot",  text: "Depends on what you need. Tell me more and I'll give you an exact price in seconds ⚡" },
    ];
  }
}

export default function DemoChatPro({ locale }: { locale: Locale }) {
  const lang = locale; // page language drives bot language
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const examples = lang === "es" ? EXAMPLES_ES : EXAMPLES_EN;
  const canRun = input.trim().length > 0 && !running && !loading;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const run = async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || running || loading) return;

    setRunning(true);
    setLoading(true);
    setMsgs([{ from: "user", text }]);

    await sleep(850);
    setLoading(false);

    const conversation = getConversation(text, lang);

    for (const msg of conversation) {
      if (msg.from === "bot") {
        setTyping(true);
        await sleep(900);
        setTyping(false);
      } else {
        await sleep(450);
      }
      setMsgs((prev) => [...prev, msg]);
    }

    // Final CTA message from bot
    setTyping(true);
    await sleep(900);
    setTyping(false);
    setMsgs((prev) => [
      ...prev,
      {
        from: "bot",
        text:
          lang === "es"
            ? "👉 Esto puede responder así 24/7 en tu negocio. ¿Querés que lo armemos para vos?"
            : "👉 This can reply like this 24/7 for your business. Want me to set it up?",
      },
    ]);

    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setLoading(false);
    setTyping(false);
    setMsgs([]);
    setInput("");
  };

  const waLink = useMemo(() => {
    const msg =
      lang === "es"
        ? `Hola, tengo un negocio de "${input}" y quiero mi bot de ventas`
        : `Hi, I have a "${input}" business and I want my sales bot`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [input, lang]);

  return (
    <div id="demo" style={{ maxWidth: 560, margin: "0 auto", scrollMarginTop: "5rem" }}>
      {/* Input + clickable examples */}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canRun && run()}
            placeholder={lang === "es" ? "¿Qué vendés? Ej: ropa, restaurant..." : "What do you sell? E.g. pizza, clothes..."}
            style={{ flex: 1, minWidth: 0 }}
            disabled={running || loading}
          />
          <button
            onClick={() => run()}
            disabled={!canRun}
            className="btn-primary"
            style={{
              opacity: canRun ? 1 : 0.5,
              cursor: canRun ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            {lang === "es" ? "Probar" : "Try"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {lang === "es" ? "Probar con:" : "Try with:"}
          </span>
          {examples.map((ex) => (
            <button
              key={ex.value}
              onClick={() => {
                setInput(ex.label);
                run(ex.label);
              }}
              disabled={running || loading}
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                border: "1px solid rgba(202,138,4,0.4)",
                background: "rgba(202,138,4,0.08)",
                color: "var(--primary)",
                fontSize: "0.78rem",
                cursor: running || loading ? "not-allowed" : "pointer",
                opacity: running || loading ? 0.5 : 1,
                transition: "background 0.2s",
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div
        style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(202,138,4,0.25)",
          borderRadius: "16px",
          padding: "1rem",
          backdropFilter: "blur(8px)",
          minHeight: "220px",
        }}
      >
        {/* Bot header bar */}
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
              {lang === "es" ? "● Activo — Respondiendo al instante" : "● Active — Replying instantly"}
            </div>
          </div>
          {msgs.length > 0 && !running && (
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
              {lang === "es" ? "Reiniciar" : "Reset"}
            </button>
          )}
        </div>

        {/* Empty state */}
        {msgs.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {lang === "es"
              ? <>Escribí qué vendés y apretá <strong style={{ color: "var(--primary)" }}>Probar</strong> 👆</>
              : <>Type what you sell and hit <strong style={{ color: "var(--primary)" }}>Try</strong> 👆</>}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div style={{ fontSize: "0.82rem", color: "rgba(202,138,4,0.8)", animation: "pulse 1.5s ease-in-out infinite" }}>
            {lang === "es" ? "⚡ Generando tu asistente IA..." : "⚡ Generating your AI assistant..."}
          </div>
        )}

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {msgs.map((m, i) => (
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
                  borderRadius: m.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
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

          {/* Typing indicator — only for bot messages */}
          {typing && (
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
                {lang === "es" ? "escribiendo..." : "typing..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post-demo CTA */}
      {msgs.length > 0 && !running && (
        <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "center" }}>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            {lang === "es" ? "👉 Crear mi bot ahora" : "👉 Get my bot now"}
          </a>
        </div>
      )}
    </div>
  );
}

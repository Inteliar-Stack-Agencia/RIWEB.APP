import { useMemo, useState } from "react";

type Msg = { from: "bot" | "user"; text: string };

const EXAMPLES = [
  { label: "Restaurante", value: "restaurante" },
  { label: "Tienda de ropa", value: "ropa" },
  { label: "Servicio técnico", value: "reparación" },
];

const WA_NUMBER = "549XXXXXXXXXX"; // <-- reemplazá con tu número real

function detectLang(input: string): "es" | "en" {
  const esHints = ["rest", "ropa", "repar", "comida", "tienda", "gym", "belle", "restaurante", "reparación", "pizza", "zapat"];
  return esHints.some((k) => input.toLowerCase().includes(k)) ? "es" : "en";
}

function getScript(input: string, lang: "es" | "en"): string[] {
  const t = input.toLowerCase();
  const is = {
    restaurant: ["rest", "pizza", "comida", "food", "restaurante", "cafe", "sushi", "burger"].some((k) => t.includes(k)),
    clothing: ["ropa", "clothing", "indumentaria", "tienda", "moda", "zapat", "boutique"].some((k) => t.includes(k)),
    repair: ["repar", "service", "fix", "técn", "tech", "reparación", "celular", "laptop"].some((k) => t.includes(k)),
  };

  if (lang === "es") {
    if (is.restaurant) return [
      "Hola 👋 ¿Buscás el menú del día o algo en particular?",
      "Tenemos opciones listas para hoy 🚀",
      "¿Te mando el menú o querés que te recomiende algo?",
    ];
    if (is.clothing) return [
      "Hola 👋 ¿Buscás algo casual, deportivo o formal?",
      "Tenemos promos activas hoy 🔥",
      "¿Qué talle estás buscando?",
    ];
    if (is.repair) return [
      "Hola 👋 ¿Qué equipo necesitás reparar?",
      "Te podemos dar un presupuesto al instante 📲",
      "¿Es celular, PC u otro dispositivo?",
    ];
    return [
      "Hola 👋 ¿En qué te puedo ayudar?",
      "Puedo responder consultas y ayudarte a comprar 🚀",
      "Contame qué estás buscando",
    ];
  } else {
    if (is.restaurant) return [
      "Hi 👋 Looking for today's menu or something specific?",
      "We have ready-to-order options 🚀",
      "Want me to suggest something?",
    ];
    if (is.clothing) return [
      "Hi 👋 Casual, sport or formal?",
      "We have active promos today 🔥",
      "What size are you looking for?",
    ];
    if (is.repair) return [
      "Hi 👋 What device do you need fixed?",
      "We can give you an instant quote 📲",
      "Is it a phone, PC or something else?",
    ];
    return [
      "Hi 👋 How can I help you?",
      "I can answer questions and help you buy 🚀",
      "Tell me what you're looking for",
    ];
  }
}

export default function DemoChatPro() {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [lang, setLang] = useState<"es" | "en">("es");

  const canRun = input.trim().length > 2 && !running && !loading;

  const run = async (value?: string) => {
    const text = (value ?? input).trim();
    if (!text || running || loading) return;

    const l = detectLang(text);
    setLang(l);
    setRunning(true);
    setLoading(true);
    setMsgs([{ from: "user", text }]);

    await new Promise((r) => setTimeout(r, 850));
    setLoading(false);

    const script = getScript(text, l);

    for (let i = 0; i < script.length; i++) {
      await new Promise((r) => setTimeout(r, 850));
      setMsgs((prev) => [...prev, { from: "bot", text: script[i] }]);
    }

    await new Promise((r) => setTimeout(r, 850));
    setMsgs((prev) => [
      ...prev,
      {
        from: "bot",
        text:
          l === "es"
            ? "👉 Esto puede responder así 24/7 en tu negocio. ¿Querés que lo armemos para vos?"
            : "👉 This can reply like this 24/7 for your business. Want me to set it up?",
      },
    ]);

    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setLoading(false);
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
            placeholder={lang === "es" ? "¿Qué vendés? / What do you sell?" : "What do you sell? / ¿Qué vendés?"}
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
            Probar
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Probar con:</span>
          {EXAMPLES.map((ex) => (
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
            <div style={{ fontSize: "0.7rem", color: "#34d399" }}>● Activo — Respondiendo al instante</div>
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
              Reiniciar
            </button>
          )}
        </div>

        {/* Empty state */}
        {msgs.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "1.5rem 0",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
            }}
          >
            Escribí qué vendés y apretá <strong style={{ color: "var(--primary)" }}>Probar</strong> 👆
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              fontSize: "0.82rem",
              color: "rgba(202,138,4,0.8)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            ⚡ Generando tu asistente IA...
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

          {/* Typing indicator */}
          {running && !loading && (
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
                escribiendo...
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

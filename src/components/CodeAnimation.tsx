import { useEffect, useState } from "react";

const CODE_LINES = [
  { text: 'const bot = await riweb.createSalesBot({ business });', color: "#a78bfa" },
  { text: 'bot.onMessage(async (msg) => reply(msg));', color: "#34d399" },
  { text: 'await bot.connectWhatsApp({ available: "24/7" });', color: "#60a5fa" },
  { text: 'leads.push({ source: "whatsapp", converted: true });', color: "#f59e0b" },
  { text: 'sales.automate({ follow_up: true, booking: true });', color: "#34d399" },
  { text: 'return { revenue_boost: "+180%", effort: "zero" };', color: "#34d399" },
  { text: 'await notify.owner({ new_sale: true, amount: "$340" });', color: "#a78bfa" },
  { text: 'bot.status // "answering 24 customers right now"', color: "#60a5fa" },
];

export default function CodeAnimation() {
  const [lines, setLines] = useState<{ text: string; color: string; id: number }[]>([]);

  useEffect(() => {
    let idx = 0;
    let id = 0;
    const interval = setInterval(() => {
      const line = CODE_LINES[idx % CODE_LINES.length];
      setLines((prev) => [...prev, { ...line, id: id++ }].slice(-6));
      idx++;
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.6)",
        border: "1px solid rgba(202,138,4,0.25)",
        borderRadius: "12px",
        padding: "1.25rem 1.5rem",
        fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
        fontSize: "0.82rem",
        lineHeight: 1.7,
        backdropFilter: "blur(8px)",
        minHeight: "200px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: "6px", marginBottom: "1rem" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f87171" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fbbf24" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
        <span
          style={{
            marginLeft: "0.75rem",
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.7rem",
            fontFamily: "inherit",
          }}
        >
          ai-sales-bot.ts
        </span>
      </div>
      {lines.map((line, i) => (
        <div
          key={line.id}
          style={{
            color: line.color,
            opacity: i === lines.length - 1 ? 1 : 0.5 + (i / lines.length) * 0.5,
            transition: "opacity 0.4s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.2)", marginRight: "0.75rem", userSelect: "none" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          {line.text}
          {i === lines.length - 1 && (
            <span style={{ animation: "blink 1s step-end infinite", color: "#ca8a04" }}>█</span>
          )}
        </div>
      ))}
    </div>
  );
}

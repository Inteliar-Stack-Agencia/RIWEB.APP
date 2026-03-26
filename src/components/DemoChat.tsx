import { useState, type FormEvent } from "react";

type Message = { from: "customer" | "bot"; text: string };

// Detect business type from user input using keyword matching
function detectCategory(input: string): string {
  const t = input.toLowerCase();
  if (/restaurant|food|comida|pizza|burger|cafe|coffee|sushi|taco|menu|eat|bar|cantina|resto/i.test(t)) return "restaurant";
  if (/cloth|ropa|fashion|moda|shirt|dress|shoes|zapatos|boutique|wear|indument/i.test(t)) return "clothing";
  if (/repair|reparaci|fix|arreglo|phone|laptop|computer|celular|tech|screen|iphone/i.test(t)) return "repair";
  if (/salon|beauty|spa|hair|peluquer|nail|uña|massage|esthetic|estetic|barberia/i.test(t)) return "beauty";
  if (/gym|fitness|yoga|sport|deporte|train|entren|crossfit|pilates/i.test(t)) return "gym";
  if (/store|shop|tienda|sell|vendo|product|producto|online|ecommerce/i.test(t)) return "store";
  return "generic";
}

// Simulated conversations per business category
const DEMOS: Record<string, Message[]> = {
  restaurant: [
    { from: "customer", text: "Hi! Do you have a table for 2 tonight at 8pm?" },
    { from: "bot", text: "Yes! We have availability at 8pm. Shall I reserve it for you right now?" },
    { from: "customer", text: "Yes please" },
    { from: "bot", text: "Done! Table for 2 at 8pm tonight. I'll send the confirmation to your WhatsApp. Any allergies?" },
  ],
  clothing: [
    { from: "customer", text: "Do you have that blue dress in size M?" },
    { from: "bot", text: "Yes! Blue dress in M is available at $49.99. Want a checkout link or pickup in store?" },
    { from: "customer", text: "Send the checkout link" },
    { from: "bot", text: "Here's your link: [checkout]. Delivery in 2-3 days. I'll track it and notify you automatically." },
  ],
  repair: [
    { from: "customer", text: "My phone screen cracked, how much to fix it?" },
    { from: "bot", text: "Depends on the model. Which phone do you have? I can give you an exact price right away." },
    { from: "customer", text: "iPhone 14" },
    { from: "bot", text: "iPhone 14 screen repair: $89, ready in ~2 hours. I have slots today at 3pm or 5pm. Which works?" },
  ],
  beauty: [
    { from: "customer", text: "Can I book a haircut for tomorrow?" },
    { from: "bot", text: "Of course! We have slots at 10am, 1pm, and 4pm tomorrow. Which time works for you?" },
    { from: "customer", text: "1pm please" },
    { from: "bot", text: "Booked for 1pm tomorrow! I'll send a reminder 1 hour before. See you then!" },
  ],
  gym: [
    { from: "customer", text: "What membership plans do you have?" },
    { from: "bot", text: "3 plans: Basic $29/mo, Pro $49/mo (includes all classes), Premium $79/mo unlimited." },
    { from: "customer", text: "Tell me more about Pro" },
    { from: "bot", text: "Pro = 24/7 gym access + all group classes + locker room. First month is $1. Want to start today?" },
  ],
  store: [
    { from: "customer", text: "Is this product still available?" },
    { from: "bot", text: "Yes, it's in stock! Do you want to order now or need more details first?" },
    { from: "customer", text: "How long does shipping take?" },
    { from: "bot", text: "Standard shipping: 3-5 days. Express 1-2 days for +$9. Which do you prefer?" },
  ],
  generic: [
    { from: "customer", text: "Hi! I'd like to know more about your services." },
    { from: "bot", text: "Hi! Happy to help. What are you looking for? I'll find the best option for you." },
    { from: "customer", text: "How much does it cost?" },
    { from: "bot", text: "Depends on what you need. Tell me a bit more and I'll give you an exact price in seconds." },
  ],
};

export default function DemoChat() {
  const [business, setBusiness] = useState("");
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(0);

  function startDemo(e: FormEvent) {
    e.preventDefault();
    if (!business.trim()) return;
    setStarted(true);
    setVisible(0);
    const msgs = DEMOS[detectCategory(business)];
    let count = 0;
    // Reveal messages one by one with a delay
    const timer = setInterval(() => {
      count++;
      setVisible(count);
      if (count >= msgs.length) clearInterval(timer);
    }, 900);
  }

  function reset() {
    setStarted(false);
    setBusiness("");
    setVisible(0);
  }

  const msgs = DEMOS[detectCategory(business)];

  return (
    <div id="demo" style={{ maxWidth: 540, margin: "0 auto", scrollMarginTop: "5rem" }}>
      {!started ? (
        // Input form before demo starts
        <form
          onSubmit={startDemo}
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <input
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="What do you sell? (e.g. pizza, clothes, repairs...)"
            style={{ flex: 1, minWidth: 200 }}
          />
          <button className="btn-primary" type="submit">
            Try demo
          </button>
        </form>
      ) : (
        // Demo chat view
        <div>
          {/* Context label */}
          <div
            style={{
              marginBottom: "0.75rem",
              textAlign: "center",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            Bot demo for:{" "}
            <strong style={{ color: "var(--primary)" }}>{business}</strong>
            <button
              onClick={reset}
              style={{
                marginLeft: "0.75rem",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.82rem",
                textDecoration: "underline",
              }}
            >
              Try another
            </button>
          </div>

          {/* Chat window */}
          <div
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(202,138,4,0.25)",
              borderRadius: "16px",
              padding: "1rem",
              backdropFilter: "blur(8px)",
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
                <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  AI Sales Bot
                </div>
                <div style={{ fontSize: "0.7rem", color: "#34d399" }}>
                  ● Active — Responding instantly
                </div>
              </div>
            </div>

            {/* Messages */}
            {msgs.slice(0, visible).map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.from === "customer" ? "flex-start" : "flex-end",
                  marginBottom: "0.55rem",
                  animation: "terminalFadeIn 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "0.6rem 0.9rem",
                    borderRadius:
                      msg.from === "customer"
                        ? "14px 14px 14px 4px"
                        : "14px 14px 4px 14px",
                    background:
                      msg.from === "customer"
                        ? "rgba(255,255,255,0.07)"
                        : "linear-gradient(135deg,#ca8a04,#d97706)",
                    color:
                      msg.from === "customer" ? "var(--text-muted)" : "#0F172A",
                    fontSize: "0.86rem",
                    fontWeight: msg.from === "bot" ? 500 : 400,
                    lineHeight: 1.45,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator while messages load */}
            {visible < msgs.length && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "0.55rem",
                }}
              >
                <div
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "14px 14px 4px 14px",
                    background: "rgba(202,138,4,0.12)",
                    color: "rgba(202,138,4,0.7)",
                    fontSize: "0.86rem",
                  }}
                >
                  typing...
                </div>
              </div>
            )}
          </div>

          {/* Post-demo nudge CTA */}
          {visible >= msgs.length && (
            <p
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              This runs 24/7 for your business, automatically.{" "}
              <strong style={{ color: "var(--primary)" }}>Want one?</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        }
    });

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

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

function buildMetaPrompt(clientName: string, bizType: string, data: TrainingData): string {
    return `Sos un experto en prompt engineering para agentes de WhatsApp con IA.
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
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
            }
        });
    }

    // Requires a logged-in user's access token (see ProtectedRoute / /dashboard in the frontend).
    // The anon key alone is not enough to reach this function's actual work.
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ") || authHeader.slice(7).trim().length === 0) {
        return json(401, { ok: false, error: "Missing bearer token" });
    }

    if (!ANTHROPIC_API_KEY) {
        return json(500, { ok: false, error: "ANTHROPIC_API_KEY is not set" });
    }

    try {
        const { clientName, bizType, training } = await req.json() as {
            clientName: string;
            bizType: string;
            training: TrainingData;
        };

        const metaPrompt = buildMetaPrompt(clientName, bizType, training);

        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-6",
                max_tokens: 4096,
                messages: [{ role: "user", content: metaPrompt }]
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return json(res.status, { ok: false, error: err?.error?.message ?? `Anthropic error ${res.status}` });
        }

        const data = await res.json() as { content: Array<{ text: string }> };
        return json(200, { ok: true, prompt: data.content[0]?.text ?? "" });
    } catch (err) {
        return json(500, { ok: false, error: err instanceof Error ? err.message : "Prompt generation failed" });
    }
});

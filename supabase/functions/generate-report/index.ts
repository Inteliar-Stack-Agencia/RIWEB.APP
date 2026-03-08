import { OpenAI } from "https://esm.sh/openai@4.28.0";

const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        }
    });

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
            }
        });
    }

    if (!OPENAI_API_KEY) {
        return json(500, { ok: false, error: "OPENAI_API_KEY is not set" });
    }

    try {
        const { audit, locale = "es" } = await req.json();
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

        const systemPrompt = locale === "es"
            ? `Eres un consultor senior de modernización web en RIWEB. Tu trabajo es transformar datos técnicos fríos en un roadmap estratégico persuasivo y de alto valor comercial.
         Tu tono es profesional, premium, directo y orientado a resultados. No uses jerga excesiva sin explicar el beneficio de negocio.`
            : `You are a senior web modernization consultant at RIWEB. Your job is to transform cold technical data into a persuasive and high-value strategic roadmap.
         Your tone is professional, premium, direct, and results-oriented. Avoid excessive jargon without explaining the business benefit.`;

        const userPrompt = locale === "es"
            ? `Genera un informe estratégico para el sitio ${audit.url}.
         DATOS TÉCNICOS:
         - Score Total: ${audit.scoreTotal}/100
         - Tech: ${JSON.stringify(audit.tech)}
         - Hallazgos: ${JSON.stringify(audit.issues)}
         - Quick Wins: ${JSON.stringify(audit.quickWins)}
         
         ESTRUCTURA DE RESPUESTA (JSON):
         {
           "summary": "Un párrafo potente que resuma la situación actual y el potencial perdido.",
           "opportunities": ["Oportunidad 1: Beneficio de negocio", "Oportunidad 2..."],
           "risks": ["Riesgo 1: Qué pasa si no se actúa", "Riesgo 2..."],
           "roadmap": ["Paso 1: Acción inmediata", "Paso 2..."],
           "cta": "Una frase corta que invite a la llamada de consultoría."
         }
         Responde SOLO en JSON.`
            : `Generate a strategic report for ${audit.url}.
         TECHNICAL DATA:
         - Total Score: ${audit.scoreTotal}/100
         - Tech: ${JSON.stringify(audit.tech)}
         - Issues: ${JSON.stringify(audit.issues)}
         - Quick Wins: ${JSON.stringify(audit.quickWins)}
         
         RESPONSE STRUCTURE (JSON):
         {
           "summary": "A powerful paragraph summarizing the current situation and lost potential.",
           "opportunities": ["Opportunity 1: Business benefit", "Opportunity 2..."],
           "risks": ["Risk 1: What happens if no action is taken", "Risk 2..."],
           "roadmap": ["Step 1: Immediate action", "Step 2..."],
           "cta": "A short phrase inviting to a consulting call."
         }
         Respond ONLY in JSON.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" }
        });

        const report = JSON.parse(completion.choices[0].message.content || "{}");

        return json(200, { ok: true, report });
    } catch (err) {
        return json(500, { ok: false, error: err instanceof Error ? err.message : "AI generation failed" });
    }
});

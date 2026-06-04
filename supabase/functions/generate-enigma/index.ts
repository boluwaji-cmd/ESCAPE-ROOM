// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

serve(async (req) => {
  try {
    const { zone, description, difficulty, companyInfo, questionTheme } = await req.json();
    const themeContext = questionTheme === "perugia_italia"
      ? "Il contesto e Perugia e l'Italia. Crea domande su storia locale, monumenti, tradizioni umbre, geografia italiana."
      : "Crea domande di cultura generale su storia, scienza, arte, geografia mondiale.";

    const prompt = `Sei un creatore di enigmi per un gioco di squadra all'aperto a Perugia.
Genera un enigma in italiano, stile quiz Kahoot.
Zona: ${zone} (${description || ''})
Difficolta: ${difficulty} (1=facile, 4=inferno)
Info aziendali: ${companyInfo || 'N/A'}
${themeContext}
Restituisci ESCLUSIVAMENTE un oggetto JSON valido:
{"question":"...","type":"true_false|multiple_choice","options":["..."],"correctAnswer":"...","hint":"indizio vago","explanation":"breve spiegazione"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8, max_tokens: 500,
      }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return new Response(JSON.stringify(parsed), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({
      question: "Cosa rende speciale questa zona di Perugia?",
      type: "multiple_choice", options: ["La storia", "L'arte", "L'architettura", "Tutte le precedenti"],
      correctAnswer: "Tutte le precedenti", hint: "Pensa a cio che hai intorno", explanation: "Ogni zona ha la sua unicità"
    }), { status: 200 });
  }
});

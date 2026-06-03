// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

serve(async (req: Request) => {
  try {
    const { zone, description, difficulty, companyInfo, previousFails, questionTheme } = await req.json();

    const isLocalTheme = questionTheme === "perugia_italia";
    const themeContext = isLocalTheme
      ? `Le domande devono riguardare la storia, l'arte, la geografia e le tradizioni di Perugia e dell'Italia. Includi riferimenti a monumenti, personaggi storici locali, eventi culturali umbri.`
      : `Le domande devono riguardare cultura generale: storia, scienza, arte, geografia mondiale. NON fare riferimenti specifici a Perugia o all'Italia.`;

    const prompt = `Sei un creatore di domande per un gioco di squadra all'aperto.
Genera una domanda in italiano, stile quiz Kahoot.

${themeContext}

Parametri:
- Zona: ${zone} (${description})
- Difficolta: ${difficulty} (1=facile, 4=inferno)
- Informazioni aziendali: ${companyInfo || "Nessuna"}
- Tentativi falliti precedenti: ${previousFails || 0}

La domanda deve essere di tipo:
- "true_false" per difficolta 1-2
- "multiple_choice" per difficolta 3-4

Per true_false, le opzioni devono essere esattamente ["Vero", "Falso"].
Per multiple_choice, fornisci 4 opzioni in italiano, una sola corretta.

Restituisci ESCLUSIVAMENTE un oggetto JSON valido, senza markdown, con questi campi:
{
  "question": "stringa",
  "type": "true_false" o "multiple_choice",
  "options": ["..."],
  "correctAnswer": "stringa esatta",
  "hint": "indizio vago, senza rivelare la risposta",
  "explanation": "breve spiegazione"
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1024,
      })
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error("Groq returned no choices");
    }
    let content = data.choices[0].message.content;

    // Strip markdown code fences if present (Groq sometimes wraps JSON in ```json)
    content = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    // Validate JSON before returning
    try { JSON.parse(content); } catch {
      throw new Error("Groq returned invalid JSON: " + content.slice(0, 200));
    }

    return new Response(content, { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

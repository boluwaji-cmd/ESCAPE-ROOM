// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { imageBase64, expectedLandmark } = await req.json();
    if (!expectedLandmark) {
      return new Response(JSON.stringify({ match: false, confidence: 0, feedback: "Nome monumento mancante" }), { status: 400 });
    }
    // Send image + prompt to Groq vision-capable model via Pollinations
    const prompt = `Analizza questa immagine. Si trova davanti al monumento "${expectedLandmark}"? Rispondi ESCLUSIVAMENTE con JSON valido: {"match":true/false,"confidence":0-100,"feedback":"breve messaggio in italiano"}`;
    
    const messages = [{ role: "user", content: prompt }];
    // Attach image if provided
    if (imageBase64) {
      messages[0].content = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ];
    }
    
    const response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages,
        jsonMode: true,
      }),
    });
    const text = await response.text();
    // Try to parse JSON from response
    try {
      const parsed = JSON.parse(text);
      return new Response(JSON.stringify(parsed), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch {
      // If parsing fails, return the raw text as feedback
      return new Response(JSON.stringify({ match: false, confidence: 50, feedback: text.slice(0, 200) }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ match: false, confidence: 0, feedback: "Errore nella verifica: " + err.message }), { status: 500 });
  }
});

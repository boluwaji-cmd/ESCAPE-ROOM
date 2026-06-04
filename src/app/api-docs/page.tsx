"use client";

export default function ApiDocsPage() {
  const functions = [
    {
      name: "check-answer",
      method: "POST",
      path: "/functions/v1/check-answer",
      params: [
        { name: "session_id", type: "uuid", desc: "ID della sessione domanda" },
        { name: "answer", type: "string", desc: "Risposta selezionata dal giocatore" },
        { name: "time_remaining", type: "number", desc: "Secondi rimanenti (0-10)" },
      ],
      response: '{ "correct": boolean, "penalty": number, "bonus": number, "new_question?": object }',
      errors: ["400: Parametri mancanti", "404: Sessione non trovata", "408: Timeout"],
      desc: "Valida la risposta del giocatore. Applica +10s di penalità se sbagliata o timeout. Genera una nuova domanda diversa. Applica -1s di bonus per tappa completata (max -5s cumulativi).",
    },
    {
      name: "generate-enigma",
      method: "POST",
      path: "/functions/v1/generate-enigma",
      params: [
        { name: "poi_name", type: "string", desc: "Nome del punto di interesse" },
        { name: "poi_description", type: "string", desc: "Descrizione del POI" },
        { name: "question_theme", type: "enum", desc: "cultura_generale | perugia_italia" },
        { name: "count", type: "number", desc: "Numero di domande da generare (default: 5)" },
      ],
      response: '{ "questions": [{ "question": string, "options": string[], "correct_answer": string, "hint": string }] }',
      errors: ["400: Tema non valido", "500: Groq API non disponibile", "504: Timeout Groq (>5s)"],
      desc: "Genera domande a risposta multipla usando Groq (Llama 3.3 70B Versatile). Restituisce JSON validato con 4 opzioni per domanda. Fallback a domande placeholder se Groq non risponde entro 5s.",
    },
    {
      name: "start-game",
      method: "POST",
      path: "/functions/v1/start-game",
      params: [
        { name: "game_id", type: "uuid", desc: "ID della partita" },
      ],
      response: '{ "status": "active", "teams": [{ "id": uuid, "starting_poi": object }] }',
      errors: ["400: game_id mancante", "409: Partita già attiva", "500: Generazione domande fallita"],
      desc: "Avvia la partita: assegna POI casuali diversi a ogni squadra, genera 5 domande per POI via generate-enigma (in parallelo), avvia il cronometro globale.",
    },
    {
      name: "cast-blind-vote",
      method: "POST",
      path: "/functions/v1/cast-blind-vote",
      params: [
        { name: "team_id", type: "uuid", desc: "ID della squadra" },
        { name: "player_id", type: "uuid", desc: "ID del giocatore che vota" },
        { name: "symbol", type: "enum", desc: "Simbolo scelto (A, B, C)" },
      ],
      response: '{ "result": "A"|"B"|"C", "vote_count": { "A": n, "B": n, "C": n }, "winner": string }',
      errors: ["400: Simbolo non valido", "409: Voto già espresso (UNIQUE constraint)", "408: Timeout votazione (30s)"],
      desc: "Votazione al buio per il Bivio Mistico. UNIQUE constraint: un voto per giocatore. Maggioranza >50% decide. Spareggio: elimina il meno votato, poi scelta casuale tra i rimanenti.",
    },
    {
      name: "validate-location",
      method: "POST",
      path: "/functions/v1/validate-location",
      params: [
        { name: "team_id", type: "uuid", desc: "ID della squadra" },
        { name: "latitude", type: "number", desc: "Latitudine GPS" },
        { name: "longitude", type: "number", desc: "Longitudine GPS" },
      ],
      response: '{ "in_range": boolean, "distance_m": number, "poi_name": string, "unlock": boolean }',
      errors: ["400: Coordinate non valide", "404: Nessun POI target per la squadra"],
      desc: "Calcola la distanza Haversine tra il giocatore e il POI target. Se <= 50m, sblocca la domanda. Anti-cheat: flag se velocità >50 m/s tra due rilevazioni consecutive.",
    },
    {
      name: "verify-photo",
      method: "POST",
      path: "/functions/v1/verify-photo",
      params: [
        { name: "image_base64", type: "string", desc: "Foto in base64" },
        { name: "poi_name", type: "string", desc: "Nome del monumento atteso" },
        { name: "attempt", type: "number", desc: "Numero tentativo (1-3)" },
      ],
      response: '{ "verified": boolean, "confidence": number, "message": string }',
      errors: ["400: Immagine non valida", "408: Timeout Pollinations.ai (>3s)", "429: Troppi tentativi"],
      desc: "Verifica che la foto scattata corrisponda al monumento atteso. Usa Pollinations.ai per analisi visiva + Groq per verifica testuale. Timeout 3s. Max 3 tentativi, poi approvazione automatica senza bonus.",
    },
    {
      name: "generate-audio",
      method: "POST",
      path: "/functions/v1/generate-audio",
      params: [
        { name: "poi_name", type: "string", desc: "Nome del punto di interesse" },
      ],
      response: '{ "audio_url": string, "expires_at": string, "duration_s": number }',
      errors: ["404: Audio non disponibile per questo POI", "500: Errore Supabase Storage"],
      desc: "Recupera l'audio-guida dal Supabase Storage. Genera un signed URL con scadenza 1 ora. Durata massima 60 secondi.",
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Documentazione API
          </h1>
          <p className="text-lg text-base-content/70">
            Escape Room Outdoor — Perugia
          </p>
          <div className="badge badge-outline mt-2">Supabase Edge Functions</div>
          <div className="badge badge-outline mt-2 ml-2">Deno/TypeScript</div>
        </div>

        {/* Overview */}
        <div className="card bg-base-100 shadow-md mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl">Panoramica</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-title">Edge Functions</div>
                <div className="stat-value text-primary text-2xl">7</div>
                <div className="stat-desc">Tutte deployate e attive</div>
              </div>
              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-title">Tempo Risposta</div>
                <div className="stat-value text-primary text-2xl">{"<3s"}</div>
                <div className="stat-desc">P95 su tutte le funzioni</div>
              </div>
              <div className="stat bg-base-200 rounded-box p-4">
                <div className="stat-title">Autenticazione</div>
                <div className="stat-value text-primary text-2xl">RLS</div>
                <div className="stat-desc">Row Level Security PostgreSQL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {functions.map((fn) => (
            <div key={fn.name} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="badge badge-primary font-mono text-sm px-3 py-1">
                    {fn.method}
                  </span>
                  <code className="text-sm bg-base-300 px-3 py-1 rounded-box">
                    {fn.path}
                  </code>
                  <h3 className="card-title text-xl ml-auto">{fn.name}</h3>
                </div>

                <p className="text-base-content/80 mt-2">{fn.desc}</p>

                {/* Parameters */}
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">Parametri</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Descrizione</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fn.params.map((p) => (
                          <tr key={p.name}>
                            <td>
                              <code className="text-xs bg-base-300 px-1 rounded">
                                {p.name}
                              </code>
                            </td>
                            <td>
                              <span className="badge badge-ghost badge-sm font-mono">
                                {p.type}
                              </span>
                            </td>
                            <td className="text-sm">{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Response */}
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">Risposta</h4>
                  <pre className="bg-base-300 p-3 rounded-box text-xs overflow-x-auto">
                    <code>{fn.response}</code>
                  </pre>
                </div>

                {/* Errors */}
                <div className="mt-2">
                  <h4 className="font-semibold text-sm mb-1">Codici di Errore</h4>
                  <div className="flex flex-wrap gap-1">
                    {fn.errors.map((e) => (
                      <span key={e} className="badge badge-error badge-sm">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-base-content/50 mt-10 pb-8">
          <p>Documentazione generata automaticamente — Team Escape Room Perugia per AS GAIA</p>
          <p>Supabase Project: onenmczbncokymqishxh • Regione: eu-central-1</p>
        </div>
      </div>
    </div>
  );
}

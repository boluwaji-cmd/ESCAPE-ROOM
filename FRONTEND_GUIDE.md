# Guida Frontend — Come chiamare le Edge Functions

**Per:** Valentin Racovita (Sviluppatore Frontend)
**Da:** Boluwaji Adepoju (Sviluppatore Backend)
**Data:** 4 Giugno 2026

---

## Come funziona

Il client Supabase e gia configurato in `src/lib/supabase.ts`:

```ts
import { supabase } from "@/lib/supabase"
```

Per chiamare qualsiasi Edge Function, usa:

```ts
const { data, error } = await supabase.functions.invoke("nome-funzione", {
  body: { ... parametri ... }
})
```

`data` contiene la risposta. `error` contiene l'errore (se presente).

---

## Tutte le 7 Edge Functions

### 1. start-game — Avvia la partita

**Quando chiamarla:** L'operatore clicca "Avvia Partita" nel pannello admin.

```ts
const { data, error } = await supabase.functions.invoke("start-game", {
  body: {
    gameName: "Partita 1",
    questionTheme: "perugia_italia"  // oppure "cultura_generale"
  }
})
// Risposta: { success: true, game: {...}, teams: [...] }
```

---

### 2. generate-enigma — Genera una domanda

**Quando chiamarla:** NON chiamarla direttamente dal frontend. Viene chiamata automaticamente da `start-game`.

```ts
// CHIAMATA AUTOMATICA DA start-game — NON serve invocarla dal frontend
```

---

### 3. check-answer — Valida la risposta del giocatore

**Quando chiamarla:** Il giocatore clicca su una risposta.

```ts
const { data, error } = await supabase.functions.invoke("check-answer", {
  body: {
    enigma_id: "uuid-dell-enigma",
    answer: "Risposta selezionata dal giocatore",
    team_id: "uuid-della-squadra",
    question_started_at: "2026-06-04T10:00:00.000Z"  // ISO timestamp
  }
})
// Risposta: { correct: true/false, message: "...", new_enigma: {...} }
```

Se `correct: false`, `new_enigma` contiene una **nuova domanda diversa**. Sostituisci la domanda corrente con quella nuova.

---

### 4. cast-blind-vote — Voto Bivio Mistico

**Quando chiamarla:** La squadra vota un simbolo al bivio.

```ts
const { data, error } = await supabase.functions.invoke("cast-blind-vote", {
  body: {
    game_id: "uuid-del-gioco",
    team_id: "uuid-della-squadra",
    branch_point_id: "uuid-del-punto-bivio",
    symbol: "A"  // A, B, o C
  }
})
// Risposta: { resolved: true/false, symbol: "A", tie: false, message: "..." }
```

---

### 5. validate-location — Anti-cheat GPS

**Quando chiamarla:** Ogni volta che la posizione GPS si aggiorna.

```ts
const { data, error } = await supabase.functions.invoke("validate-location", {
  body: {
    team_id: "uuid-della-squadra",
    latitude: 43.1107,
    longitude: 12.3908,
    timestamp: new Date().toISOString()
  }
})
// Risposta: { valid: true/false, reason: "...", speed: 1.2 }
```

Se `valid: false`, mostra un warning. Velocita >50 m/s = movimento sospetto.

---

### 6. verify-photo — Verifica foto del monumento

**Quando chiamarla:** Il giocatore scatta una foto al monumento.

```ts
// 1. Converti la foto in base64
const file = ... // da <input type="file"> o <camera>
const reader = new FileReader()
reader.readAsDataURL(file)
reader.onload = async () => {
  const base64 = reader.result.split(',')[1]  // rimuovi il prefisso "data:image/jpeg;base64,"

  // 2. Chiama la Edge Function
  const { data, error } = await supabase.functions.invoke("verify-photo", {
    body: {
      imageBase64: base64,
      expectedLandmark: "Fontana Maggiore"  // nome del monumento atteso
    }
  })
  // Risposta: { match: true/false, confidence: 85, feedback: "La foto mostra..." }
}
```

**A cosa serve:** Verifica che il giocatore sia realmente davanti al monumento. L'AI (Pollinations.ai) analizza la foto e conferma se corrisponde al luogo atteso. Impedisce di barare (non puoi inviare foto da internet).

**Perche e necessaria:** L'escape room e outdoor, non c'e un arbitro fisico a ogni tappa. La verifica automatica garantisce che la squadra abbia raggiunto il luogo.

---

### 7. generate-audio — Audioguida del monumento

**Quando chiamarla:** La squadra arriva a una nuova tappa.

```ts
const { data, error } = await supabase.functions.invoke("generate-audio", {
  body: {
    zoneName: "Fontana Maggiore",
    description: "Capolavoro medievale nel cuore di Perugia"  // opzionale
  }
})
// Risposta: {
//   audioUrl: "https://...supabase.co/storage/...mp3?token=...",
//   cached: true/false,
//   narration: "Fontana Maggiore, capolavoro medievale...",
//   duration_estimate_seconds: 7
// }

// 3. Riproduci l'audio nel browser
const audio = new Audio(data.audioUrl)
audio.play()
```

**A cosa serve:** Quando una squadra arriva a un monumento, parte automaticamente una breve audioguida (30-60 sec) che racconta una curiosita storica sul luogo. L'audio viene generato dall'AI e sintetizzato in voce italiana.

**Perche e necessaria:** Aggiunge valore culturale all'esperienza. Invece di limitarsi a rispondere a domande, i giocatori imparano qualcosa sul monumento. Differenzia il prodotto da una semplice caccia al tesoro.

**Prima chiamata:** ~5 secondi (l'AI scrive il testo, il TTS genera l'audio).
**Chiamate successive:** Istantanee (l'audio e in cache su Supabase Storage).

---

## Riepilogo: chi chiama cosa

| Funzione | Chi la chiama | Quando |
|----------|--------------|--------|
| `start-game` | Admin panel | Operatore clicca "Avvia" |
| `generate-enigma` | **Nessuno** (chiamata da `start-game`) | Automatica |
| `check-answer` | Pagina enigma | Giocatore risponde |
| `cast-blind-vote` | Pagina bivio | Squadra vota |
| `validate-location` | Pagina mappa | Aggiornamento GPS |
| **`verify-photo`** | Pagina enigma | Giocatore scatta foto |
| **`generate-audio`** | Pagina mappa/enigma | Arrivo alla tappa |

---

## Variabili d'ambiente (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://onenmczbncokymqishxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sZ9G9E-p_dnYn8RYuIVGsA_6FfToqJR
```

Queste sono gia configurate. Non serve modificarle.

/**
 * gameLogic.ts — Funzioni pure di logica di gioco (testabili senza Supabase)
 * Estratte dalle Edge Functions per consentire unit testing.
 */

/** Confronto case-insensitive, trim, normalizzato */
export function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

/** Verifica se il tempo e scaduto (10 secondi) */
export function isTimedOut(startedAt: string, timeoutSeconds = 10): boolean {
  const started = new Date(startedAt).getTime();
  const now = Date.now();
  return (now - started) > (timeoutSeconds * 1000);
}

/** Calcola il tempo rimanente in secondi */
export function timeLeft(startedAt: string, timeoutSeconds = 10): number {
  const started = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = (now - started) / 1000;
  return Math.max(0, timeoutSeconds - elapsed);
}

/** Incrementa il bonus tappa (max 5) */
export function incrementLocationBonus(currentBonus: number): number {
  return Math.min(currentBonus + 1, 5);
}

/** Calcola penalita per risposta sbagliata o timeout */
export function addPenalty(currentPenalty: number, seconds = 10): number {
  return currentPenalty + seconds;
}

/** Calcola il tempo totale effettivo (penalita - bonus) */
export function effectiveTime(penaltySeconds: number, locationBonus: number): number {
  return penaltySeconds - locationBonus;
}

/** Verifica se una domanda e gia stata fallita */
export function isAlreadyFailed(failedIds: string[], enigmaId: string): boolean {
  return failedIds.includes(enigmaId);
}

/** Aggiunge un ID alla lista dei falliti (senza duplicati) */
export function addFailedId(failedIds: string[], enigmaId: string): string[] {
  if (failedIds.includes(enigmaId)) return failedIds;
  return [...failedIds, enigmaId];
}

/** Ordina le squadre per tempo effettivo (crescente = migliore) */
export function rankTeams(teams: { id: string; penaltySeconds: number; locationBonus: number }[]) {
  return [...teams]
    .map(t => ({ ...t, effectiveTime: effectiveTime(t.penaltySeconds, t.locationBonus) }))
    .sort((a, b) => a.effectiveTime - b.effectiveTime);
}

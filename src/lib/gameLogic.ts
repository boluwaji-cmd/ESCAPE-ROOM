// Funzioni pure per la logica di gioco — timer, penalita, bonus, ranking

export function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

export function isTimedOut(startedAt: string, timeoutSeconds: number): boolean {
  return (Date.now() - new Date(startedAt).getTime()) > timeoutSeconds * 1000;
}

export function timeLeft(startedAt: string, timeoutSeconds: number): number {
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  return Math.max(0, timeoutSeconds - elapsed);
}

export function incrementLocationBonus(current: number, max: number = 5): number {
  return Math.min(current + 1, max);
}

export function addPenalty(current: number, penaltySeconds: number): number {
  return current + penaltySeconds;
}

export function effectiveTime(totalPenalty: number, locationBonus: number): number {
  return totalPenalty - locationBonus;
}

export function isAlreadyFailed(failedIds: string[], enigmaId: string): boolean {
  return failedIds.includes(enigmaId);
}

export function addFailedId(failedIds: string[], enigmaId: string): string[] {
  return failedIds.includes(enigmaId) ? failedIds : [...failedIds, enigmaId];
}

export function rankTeams(teams: Array<{ id: string; total_penalty_seconds: number; location_bonus: number }>) {
  return [...teams].sort((a, b) => {
    const timeA = effectiveTime(a.total_penalty_seconds, a.location_bonus);
    const timeB = effectiveTime(b.total_penalty_seconds, b.location_bonus);
    return timeA - timeB;
  });
}

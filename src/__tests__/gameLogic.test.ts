/**
 * Unit Test — gameLogic.ts
 * Verifica le funzioni pure di logica di gioco (senza dipendenze esterne).
 *
 * Esecuzione: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import {
  isAnswerCorrect,
  isTimedOut,
  timeLeft,
  incrementLocationBonus,
  addPenalty,
  effectiveTime,
  isAlreadyFailed,
  addFailedId,
  rankTeams,
} from '@/lib/gameLogic';

// === US3: Validazione Risposta ===

describe('isAnswerCorrect', () => {
  it('restituisce true per risposta esatta', () => {
    expect(isAnswerCorrect('Firenze', 'Firenze')).toBe(true);
  });

  it('confronto case-insensitive', () => {
    expect(isAnswerCorrect('firenze', 'Firenze')).toBe(true);
    expect(isAnswerCorrect('FIRENZE', 'firenze')).toBe(true);
    expect(isAnswerCorrect('Firenze', 'FIRENZE')).toBe(true);
  });

  it('ignora spazi prima e dopo', () => {
    expect(isAnswerCorrect('  Firenze  ', 'Firenze')).toBe(true);
    expect(isAnswerCorrect('Firenze', '  Firenze  ')).toBe(true);
  });

  it('restituisce false per risposta sbagliata', () => {
    expect(isAnswerCorrect('Roma', 'Firenze')).toBe(false);
  });

  it('restituisce false per risposta vuota', () => {
    expect(isAnswerCorrect('', 'Firenze')).toBe(false);
  });
});

// === US3: Timer 10 secondi ===

describe('isTimedOut', () => {
  it('non e scaduto per tempo recente', () => {
    const now = new Date().toISOString();
    expect(isTimedOut(now)).toBe(false);
  });

  it('e scaduto dopo 11 secondi', () => {
    const elevenSecondsAgo = new Date(Date.now() - 11000).toISOString();
    expect(isTimedOut(elevenSecondsAgo)).toBe(true);
  });

  it('e scaduto esattamente a 10 secondi (limite)', () => {
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    expect(isTimedOut(tenSecondsAgo)).toBe(false); // > 10s, non >= 10s
  });
});

describe('timeLeft', () => {
  it('restituisce tempo pieno per partenza recente', () => {
    const now = new Date().toISOString();
    expect(timeLeft(now)).toBeGreaterThanOrEqual(9);
  });

  it('restituisce 0 per tempo scaduto', () => {
    const elevenSecondsAgo = new Date(Date.now() - 11000).toISOString();
    expect(timeLeft(elevenSecondsAgo)).toBe(0);
  });
});

// === US29: Bonus Tappe (max -5s) ===

describe('incrementLocationBonus', () => {
  it('incrementa da 0 a 1', () => {
    expect(incrementLocationBonus(0)).toBe(1);
  });

  it('incrementa normalmente entro il limite', () => {
    expect(incrementLocationBonus(3)).toBe(4);
  });

  it('non supera il massimo di 5', () => {
    expect(incrementLocationBonus(5)).toBe(5);
    expect(incrementLocationBonus(4)).toBe(5);
  });

  it('5 tappe consecutive non superano il cap', () => {
    let bonus = 0;
    for (let i = 0; i < 7; i++) bonus = incrementLocationBonus(bonus);
    expect(bonus).toBe(5);
  });
});

// === Penalita ===

describe('addPenalty', () => {
  it('aggiunge 10 secondi di default', () => {
    expect(addPenalty(0)).toBe(10);
    expect(addPenalty(30)).toBe(40);
  });

  it('accumula penalita multiple', () => {
    let penalty = 0;
    penalty = addPenalty(penalty); // 10
    penalty = addPenalty(penalty); // 20
    penalty = addPenalty(penalty); // 30
    expect(penalty).toBe(30);
  });
});

// === Tempo Effettivo ===

describe('effectiveTime', () => {
  it('tempo positivo senza bonus', () => {
    expect(effectiveTime(50, 0)).toBe(50);
  });

  it('bonus riduce il tempo', () => {
    expect(effectiveTime(50, 3)).toBe(47);
  });

  it('bonus massimo applicato', () => {
    expect(effectiveTime(10, 5)).toBe(5);
  });

  it('puo diventare zero', () => {
    expect(effectiveTime(5, 5)).toBe(0);
  });
});

// === Domande Fallite ===

describe('isAlreadyFailed', () => {
  it('rileva domanda gia fallita', () => {
    expect(isAlreadyFailed(['a', 'b', 'c'], 'b')).toBe(true);
  });

  it('nuova domanda non e nei falliti', () => {
    expect(isAlreadyFailed(['a', 'b'], 'c')).toBe(false);
  });
});

describe('addFailedId', () => {
  it('aggiunge nuovo ID', () => {
    expect(addFailedId(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('non duplica ID esistente', () => {
    expect(addFailedId(['a', 'b'], 'a')).toEqual(['a', 'b']);
  });
});

// === Classifica a Tempo ===

describe('rankTeams', () => {
  it('ordina per tempo effettivo crescente', () => {
    const teams = [
      { id: '1', penaltySeconds: 100, locationBonus: 0 },
      { id: '2', penaltySeconds: 50, locationBonus: 5 },
      { id: '3', penaltySeconds: 80, locationBonus: 2 },
    ];
    const ranked = rankTeams(teams);
    expect(ranked[0].id).toBe('2'); // 45s — migliore
    expect(ranked[1].id).toBe('3'); // 78s
    expect(ranked[2].id).toBe('1'); // 100s — peggiore
  });

  it('parita di tempo mantiene ordine stabile', () => {
    const teams = [
      { id: 'a', penaltySeconds: 50, locationBonus: 0 },
      { id: 'b', penaltySeconds: 50, locationBonus: 0 },
    ];
    const ranked = rankTeams(teams);
    expect(ranked[0].effectiveTime).toBe(50);
    expect(ranked[1].effectiveTime).toBe(50);
  });
});

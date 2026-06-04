import { describe, it, expect } from 'vitest';
import { isAnswerCorrect, isTimedOut, timeLeft, incrementLocationBonus, addPenalty, effectiveTime, isAlreadyFailed, addFailedId, rankTeams } from '../lib/gameLogic';

describe('isAnswerCorrect', () => {
  it('dovrebbe accettare risposta esatta', () => { expect(isAnswerCorrect('Perugia', 'Perugia')).toBe(true); });
  it('dovrebbe essere case-insensitive', () => { expect(isAnswerCorrect('perugia', 'PERUGIA')).toBe(true); });
  it('dovrebbe ignorare spazi', () => { expect(isAnswerCorrect('  Perugia  ', 'Perugia')).toBe(true); });
  it('dovrebbe rifiutare risposta errata', () => { expect(isAnswerCorrect('Roma', 'Perugia')).toBe(false); });
});

describe('isTimedOut', () => {
  it('non in timeout se appena iniziato', () => { expect(isTimedOut(new Date().toISOString(), 10)).toBe(false); });
  it('in timeout dopo 11 secondi', () => { const past = new Date(Date.now() - 11000).toISOString(); expect(isTimedOut(past, 10)).toBe(true); });
});

describe('timeLeft', () => {
  it('dovrebbe restituire tempo rimanente', () => { expect(timeLeft(new Date().toISOString(), 10)).toBeGreaterThan(0); });
  it('non dovrebbe scendere sotto zero', () => { const past = new Date(Date.now() - 20000).toISOString(); expect(timeLeft(past, 10)).toBe(0); });
});

describe('incrementLocationBonus', () => {
  it('dovrebbe incrementare di 1', () => { expect(incrementLocationBonus(2)).toBe(3); });
  it('non dovrebbe superare il massimo (5)', () => { expect(incrementLocationBonus(5)).toBe(5); });
  it('non dovrebbe superare 4 con cap 4', () => { expect(incrementLocationBonus(4, 4)).toBe(4); });
});

describe('addPenalty', () => {
  it('dovrebbe sommare penalita', () => { expect(addPenalty(0, 10)).toBe(10); });
  it('dovrebbe accumulare penalita', () => { expect(addPenalty(20, 10)).toBe(30); });
});

describe('effectiveTime', () => {
  it('dovrebbe calcolare tempo effettivo', () => { expect(effectiveTime(30, 5)).toBe(25); });
  it('bonus non puo superare penalita', () => { expect(effectiveTime(5, 10)).toBe(-5); });
});

describe('isAlreadyFailed', () => {
  it('dovrebbe rilevare enigma gia fallito', () => { expect(isAlreadyFailed(['a', 'b'], 'a')).toBe(true); });
  it('non ancora fallito', () => { expect(isAlreadyFailed(['a'], 'b')).toBe(false); });
});

describe('addFailedId', () => {
  it('dovrebbe aggiungere nuovo id', () => { expect(addFailedId(['a'], 'b')).toEqual(['a', 'b']); });
  it('non dovrebbe duplicare', () => { expect(addFailedId(['a'], 'a')).toEqual(['a']); });
});

describe('rankTeams', () => {
  it('dovrebbe ordinare per tempo effettivo crescente', () => {
    const teams = [
      { id: '1', total_penalty_seconds: 100, location_bonus: 5 },
      { id: '2', total_penalty_seconds: 90, location_bonus: 0 },
      { id: '3', total_penalty_seconds: 50, location_bonus: 5 },
    ];
    const ranked = rankTeams(teams);
    expect(ranked[0].id).toBe('3');
    expect(ranked[1].id).toBe('2');
    expect(ranked[2].id).toBe('1');
  });
});

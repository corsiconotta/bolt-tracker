import { Injection } from '../types';
import { HALF_LIFE, ESTER_FREE_WEIGHT, MG_DILUTES_TO, TEST_DROP_CONSTANT, INITIAL_SERUM_LEVEL } from '../constants';

export const getDayNumber = (date: string, timeOfDay: string, firstInjectionDate?: Date): number => {
  const startDate = firstInjectionDate ? new Date(firstInjectionDate) : new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays + (timeOfDay === 'night' ? 0.5 : 0);
};

export const getWeekNumber = (dayNumber: number): number => {
  return Math.floor(dayNumber / 7);
};

export const calculateTestEInOil = (currentInjection: Injection, previousInjection?: Injection): number => {
  if (!previousInjection) {
    return currentInjection.amount;
  }
  
  const previousTestEInOil = previousInjection.testEInOil ?? 0;
  const daysDiff = currentInjection.dayNumber - previousInjection.dayNumber;
  return previousTestEInOil * Math.pow(0.5, daysDiff / HALF_LIFE) + currentInjection.amount;
};

export const calculateTestEReleased = (testEInOil: number): number => {
  return testEInOil * Math.log(2) / HALF_LIFE * ESTER_FREE_WEIGHT;
};

export const calculateSerumTLevel = (
  currentInjection: Injection & { testEInOil: number },
  previousInjection?: Injection
): number => {
  const testEReleased = calculateTestEReleased(currentInjection.testEInOil);
  
  if (!previousInjection) {
    return INITIAL_SERUM_LEVEL +
      (testEReleased / 2 * MG_DILUTES_TO) -
      (INITIAL_SERUM_LEVEL * TEST_DROP_CONSTANT);
  }

  const previousLevel = previousInjection.serumTLevel ?? INITIAL_SERUM_LEVEL;
  const serumTDrop = previousLevel * TEST_DROP_CONSTANT;
  
  return previousLevel + (testEReleased / 2 * MG_DILUTES_TO) - serumTDrop;
};
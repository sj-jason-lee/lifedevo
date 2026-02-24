import type { ReadingPlan, ReadingPlanDay } from '../types';

export const readingPlan: ReadingPlan = {
  id: '1',
  name: 'Gospel of John',
  totalDays: 21,
  description: 'A 21-day journey through the Gospel of John',
  days: [
    { day: 1, passage: 'John 1' },
    { day: 2, passage: 'John 2' },
    { day: 3, passage: 'John 3' },
    { day: 4, passage: 'John 4' },
    { day: 5, passage: 'John 5' },
    { day: 6, passage: 'John 6:1–40' },
    { day: 7, passage: 'John 6:41–71' },
    { day: 8, passage: 'John 7' },
    { day: 9, passage: 'John 8' },
    { day: 10, passage: 'John 9' },
    { day: 11, passage: 'John 10' },
    { day: 12, passage: 'John 11' },
    { day: 13, passage: 'John 12' },
    { day: 14, passage: 'John 13' },
    { day: 15, passage: 'John 14' },
    { day: 16, passage: 'John 15' },
    { day: 17, passage: 'John 16' },
    { day: 18, passage: 'John 17' },
    { day: 19, passage: 'John 18' },
    { day: 20, passage: 'John 19' },
    { day: 21, passage: 'John 20–21' },
  ],
};

export const getPlanById = (id: string): ReadingPlan | undefined =>
  [readingPlan].find((p) => p.id === id);

export const getPlanDay = (planId: string, dayNumber: number): ReadingPlanDay | undefined => {
  const plan = getPlanById(planId);
  return plan?.days.find((d) => d.day === dayNumber);
};

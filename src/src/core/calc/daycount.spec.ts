import { describe, it, expect } from 'vitest';
import { dayCount, yearFraction, couponSchedule, type YMD } from './daycount';

describe('daycount', () => {
  it('dayCount actual/actual (basis 1)', () => {
    expect(dayCount(1, { year: 2024, month: 1, day: 1 }, { year: 2024, month: 7, day: 1 })).toBe(182);
  });

  it('dayCount US 30/360 (basis 0)', () => {
    expect(dayCount(0, { year: 2024, month: 1, day: 1 }, { year: 2024, month: 7, day: 1 })).toBe(180);
  });

  it('dayCount actual/365 (basis 3)', () => {
    expect(dayCount(3, { year: 2024, month: 1, day: 1 }, { year: 2024, month: 7, day: 1 })).toBe(182);
  });

  it('yearFraction actual/360 (basis 2)', () => {
    const yf = yearFraction(2, { year: 2024, month: 1, day: 1 }, { year: 2024, month: 7, day: 1 });
    expect(yf).toBeCloseTo(182 / 360, 10);
  });

  it('couponSchedule returns positive n and valid YMD', () => {
    const s = couponSchedule({ year: 2024, month: 2, day: 1 }, { year: 2024, month: 8, day: 1 }, 2, 0);
    expect(Number.isInteger(s.n)).toBe(true);
    expect(s.n).toBeGreaterThan(0);
    const valid = (d: YMD) =>
      d.year > 0 && d.month >= 1 && d.month <= 12 && d.day >= 1 && d.day <= 31;
    expect(valid(s.prevCoupon)).toBe(true);
    expect(valid(s.nextCoupon)).toBe(true);
    expect(s.n).toBe(1);
  });
});

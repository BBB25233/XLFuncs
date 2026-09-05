import { describe, it, expect } from 'vitest';
import {
  erf,
  erfc,
  gamma,
  lngamma,
  beta,
  lowerRegGamma,
} from './special';
import {
  cplx,
  cAbs,
  cAdd,
  cMul,
  cExp,
  complexText,
} from './complex';

describe('special functions', () => {
  it('erf / erfc reference values', () => {
    expect(erf(1)).toBeCloseTo(0.8427008, 6);
    expect(erfc(1)).toBeCloseTo(0.1572992, 6);
    expect(erf(0)).toBe(0);
  });

  it('gamma / lngamma reference values', () => {
    expect(gamma(5)).toBeCloseTo(24, 6);
    expect(lngamma(5)).toBeCloseTo(Math.log(24), 6); // ≈ 3.1780538303
    expect(gamma(0.5)).toBeCloseTo(Math.sqrt(Math.PI), 6); // ≈ 1.7724538509
  });

  it('beta reference value', () => {
    expect(beta(2, 3)).toBeCloseTo(1 / 12, 6); // 0.0833333
  });

  it('lowerRegGamma reference value', () => {
    expect(lowerRegGamma(1, 1)).toBeCloseTo(0.6321206, 6);
  });
});

describe('complex numbers', () => {
  it('cAbs / cAdd / cMul', () => {
    expect(cAbs(cplx(3, 4))).toBe(5);
    expect(cAdd(cplx(1, 2), cplx(3, 4))).toEqual({ re: 4, im: 6 });
    expect(cMul(cplx(1, 2), cplx(0, 1))).toEqual({ re: -2, im: 1 });
  });

  it('Euler identity via cExp', () => {
    const z = cExp(cplx(0, Math.PI));
    expect(z.re).toBeCloseTo(-1, 6);
    expect(z.im).toBeCloseTo(0, 6);
  });

  it('complexText formatting', () => {
    expect(complexText(3, 4)).toBe('3+4i');
    expect(complexText(3, -4)).toBe('3-4i');
  });
});

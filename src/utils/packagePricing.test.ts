import { describe, expect, it } from 'vitest';
import { computeCubicMeter, computePaymentStatus, computePrice } from './packagePricing';

describe('computeCubicMeter', () => {
  it('convertit des centimètres en mètres cubes', () => {
    expect(computeCubicMeter(100, 50, 40)).toBe(0.2);
  });

  it('ne descend jamais sous le volume minimal facturé', () => {
    expect(computeCubicMeter(1, 1, 1)).toBe(0.001);
  });
});

describe('computePrice', () => {
  it('arrondit le prix au franc près', () => {
    expect(computePrice(0.2345, 380_000)).toBe(89_110);
  });
});

describe('computePaymentStatus', () => {
  it('indique le statut selon le montant déjà payé', () => {
    expect(computePaymentStatus(0, 1000)).toBe('unpaid');
    expect(computePaymentStatus(400, 1000)).toBe('partial');
    expect(computePaymentStatus(1000, 1000)).toBe('paid');
  });
});

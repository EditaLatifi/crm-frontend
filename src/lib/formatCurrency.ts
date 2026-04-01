/**
 * Rounds to nearest 5 Rappen (CHF convention: last digit is 0 or 5).
 * Rounding logic: Math.round(value * 20) / 20
 * Format: 43'453.90 CHF (apostrophe thousands separator per CH convention)
 */
export function formatCHF(value: number): string {
  const rounded = Math.round(value * 20) / 20;
  return rounded.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' CHF';
}

export function formatCurrency(value: number, currency = 'CHF'): string {
  if (currency === 'CHF') return formatCHF(value);
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;
}

// src/utils/formatters.ts
export function formatCurrency(value: number, locale = 'pt-PT', currency = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

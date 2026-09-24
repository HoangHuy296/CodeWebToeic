export function formatCurrency(value: number, currency = 'VND') {
  return `${value.toLocaleString('vi-VN')} ${currency}`;
}

/**
 * `locale` defaults to `vi-VN` for now — callers switch it to `en-US` once their own page adopts
 * the language-aware render pass (see docs/language-en-vi-plan.md, Dot 2/3); this signature is
 * ready for that without another breaking change.
 */
export function formatDateTime(value?: string, locale: string = 'vi-VN') {
  if (!value) {
    return locale === 'en-US' ? 'Not updated yet' : 'Chua cap nhat';
  }

  return new Date(value).toLocaleString(locale);
}

export function parseCommaList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseLineList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

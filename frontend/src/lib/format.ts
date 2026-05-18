export function formatCurrency(value: number, currency = 'VND') {
  return `${value.toLocaleString('vi-VN')} ${currency}`;
}

export function formatDateTime(value?: string) {
  if (!value) {
    return 'Chua cap nhat';
  }

  return new Date(value).toLocaleString('vi-VN');
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

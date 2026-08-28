export function formatMonthYear(value: string): string {
  if (!value) return '';
  // value is YYYY-MM
  const [y, m] = value.split('-');
  if (!y) return value;
  if (!m) return y;
  const monthIndex = parseInt(m, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return y;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[monthIndex]} ${y}`;
}

export function formatDateRange(
  start: string,
  end: string,
  current: boolean
): string {
  const s = formatMonthYear(start);
  const e = current ? 'Present' : formatMonthYear(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || '';
}

export function formatYearRange(start: string, end: string): string {
  const s = start || '';
  const e = end || '';
  if (s && e) return `${s} – ${e}`;
  return s || e || '';
}

export function safeFileName(fullName: string): string {
  const name = fullName.trim();
  if (!name) return 'My-CV';
  return name.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export function splitCommas(value: string): string[] {
  return value
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
}

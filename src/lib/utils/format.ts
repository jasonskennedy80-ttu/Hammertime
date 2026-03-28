import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function formatDate(date: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—'
  try {
    return format(parseISO(date), fmt)
  } catch {
    return date
  }
}

export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true })
  } catch {
    return date
  }
}

export function formatName(firstName: string, lastName: string, company?: string | null): string {
  const name = `${firstName} ${lastName}`.trim()
  return company ? `${name} — ${company}` : name
}

export function formatAddress(
  line1?: string | null,
  line2?: string | null,
  city?: string | null,
  state?: string | null,
  zip?: string | null,
): string {
  const parts = [line1, line2, [city, state].filter(Boolean).join(', '), zip]
  return parts.filter(Boolean).join(', ')
}

export function lineItemTotal(qty: number, unitPrice: number, markup: number): number {
  return qty * unitPrice * (1 + markup / 100)
}

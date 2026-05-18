import {
  differenceInMilliseconds,
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisYear,
} from 'date-fns'
import { ko } from 'date-fns/locale'

export function compactCount(n: number | null | undefined): string {
  if (!n) return ''
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function dayKey(iso: string): string {
  return format(new Date(iso), 'yyyy-MM-dd')
}

export function dayLabel(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return '오늘'
  if (isYesterday(d)) return '어제'
  if (isThisYear(d)) return format(d, 'M월 d일 (E)', { locale: ko })
  return format(d, 'yyyy년 M월 d일 (E)', { locale: ko })
}

export function within(a: string, b: string, ms: number): boolean {
  return Math.abs(differenceInMilliseconds(new Date(a), new Date(b))) < ms
}

export function formatCompactHM(iso: string): string {
  return format(new Date(iso), 'a h:mm', { locale: ko })
}

export function formatMessageTime(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return format(d, 'a h:mm', { locale: ko })
  if (!isThisYear(d)) return format(d, 'yyyy년 M월 d일 a h:mm', { locale: ko })
  return format(d, 'M월 d일 a h:mm', { locale: ko })
}

export function formatFullTime(iso: string): string {
  return format(new Date(iso), 'yyyy년 M월 d일 (EEEE) a h:mm:ss', { locale: ko })
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ko })
}

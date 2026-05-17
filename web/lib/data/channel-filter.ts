/**
 * UI 에서 노출하지 않을 채널 이름 패턴.
 *
 * - "management" 부분 문자열 포함 (예: _management-9th, _team-management-committee)
 * - "tf" 가 단어 단위로 포함 (예: _tf-vision-2026)
 *
 * 주의: DB 권한 차단이 아닌 UI 필터일 뿐. 직접 SQL/REST 접근은 막지 않음.
 * 추후 per-user channel authorization 도입 시 자연 해결.
 */
export const HIDDEN_NAME_LIKE = '%management%'
export const HIDDEN_NAME_REGEX = '(^|[-_])tf([-_]|$)'

export function isChannelHiddenByName(name: string | null | undefined): boolean {
  if (!name) return false
  if (name.toLowerCase().includes('management')) return true
  if (/(^|[-_])tf([-_]|$)/i.test(name)) return true
  return false
}

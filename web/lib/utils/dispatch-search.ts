export const SEARCH_OPEN_EVENT = 'search-panel:open'

export function dispatchSearchOpen() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(SEARCH_OPEN_EVENT))
}

export function isObserverAvailable(): boolean {
  return Boolean(typeof window !== 'undefined' && window.IntersectionObserver)
}

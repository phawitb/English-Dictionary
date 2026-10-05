export function registerPwa(
  serviceWorker = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined,
) {
  if (!serviceWorker) return Promise.resolve(undefined)
  return serviceWorker.register('/sw.js')
}

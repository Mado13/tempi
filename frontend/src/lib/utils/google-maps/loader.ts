let mapsPromise: Promise<typeof google.maps> | null = null

export function loadGoogleMaps(
  apiKey: string,
  libraries: string[] = ['places'],
  lang?: string,
  region?: string,
): Promise<typeof google.maps> {
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise((resolve, reject) => {
    function isReady() {
      return Boolean(window.google?.maps && window.google.maps.places)
    }

    if (isReady()) {
      resolve(window.google.maps)
      return
    }

    const existing = document.getElementById('google-maps') as HTMLScriptElement | null
    if (existing) {
      if (isReady()) {
        resolve(window.google.maps)
      } else {
        existing.addEventListener('load', () => {
          isReady()
            ? resolve(window.google.maps)
            : reject(new Error('Google Maps failed to initialize'))
        })
        existing.addEventListener('error', reject)
      }
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps'
    const params = new URLSearchParams({
      key: apiKey,
      libraries: libraries.join(','),
      ...(lang ? { language: lang } : {}),
      ...(region ? { region } : {}),
    })
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`
    script.async = true
    script.defer = true

    script.onload = () =>
      isReady()
        ? resolve(window.google.maps)
        : reject(new Error('Google Maps failed to initialize'))
    script.onerror = reject

    document.head.appendChild(script)
  })

  return mapsPromise
}

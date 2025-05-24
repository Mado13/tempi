// src/lib/loadGoogleMaps.ts
export function loadGoogleMaps(apiKey: string, libs: string[] = []): Promise<typeof google.maps> {
  return new Promise((resolve, reject) => {
    function isReady() {
      return !!(window.google && window.google.maps && window.google.maps.places)
    }
    if (isReady()) return resolve(window.google.maps)

    const existing = document.getElementById('google-maps')
    if (existing) {
      existing.addEventListener('load', () => isReady() && resolve(window.google.maps))
      existing.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs.join(',')}`
    script.async = true
    script.defer = true
    script.onload = () => (isReady() ? resolve(window.google.maps) : reject(new Error('Google Maps failed to load')))
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export function fetchAutocompleteSuggestions(input: string, maps: typeof google.maps) {
  maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken: '123',
  })
}

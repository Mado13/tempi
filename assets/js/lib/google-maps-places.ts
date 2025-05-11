type PlaceDetails = {
  name?: string | null
  formattedAddress?: string | null
  addressComponents?: google.maps.places.AddressComponent[]
  location?: google.maps.LatLng | null
}

export class GoogleMapsPlaces {
  private apiKey: string
  private libraries: string[]
  private maps: typeof google.maps | undefined
  private autocompleteService: google.maps.places.AutocompleteSuggestion | undefined
  public sessionToken: google.maps.places.AutocompleteSessionToken | undefined
  private isLoaded: boolean = false

  constructor(apiKey: string, libraries: string[] = ['places']) {
    this.apiKey = apiKey
    this.libraries = libraries
  }

  createSessionToken() {
    if (this.maps) {
      this.sessionToken = new this.maps.places.AutocompleteSessionToken()
    }
  }

  destroySessionToken() {
    this.sessionToken = undefined
  }

  async load() {
    if (this.isLoaded) return
    this.maps = await this.loadGoogleMaps()
    this.autocompleteService = new this.maps.places.AutocompleteSuggestion()
    this.sessionToken = new this.maps.places.AutocompleteSessionToken()
    this.isLoaded = true
  }

  async fetchAutocompleteSuggestions(input: string) {
    if (!this.autocompleteService || !this.sessionToken) {
      throw new Error('Google Maps not loaded')
    }

    const { suggestions } = await this.maps!.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: this.sessionToken,
    })

    return suggestions.reduce<Record<string, string>>((acc, suggestion) => {
      const place = suggestion.placePrediction
      if (place && place.placeId && place.text) {
        acc[place.placeId] = place.text.toString()
      }
      return acc
    }, {})
  }

  async fetchPlaceDetails(placeId: string): Promise<PlaceDetails | undefined> {
    if (!this.maps) throw new Error('Google Maps not loaded')
    const place = new this.maps.places.Place({ id: placeId, requestedLanguage: 'he', requestedRegion: 'IL' })
    await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'addressComponents', 'location'] })
    console.log({ place })
    return {
      name: place.displayName,
      formattedAddress: place.formattedAddress,
      addressComponents: place.addressComponents,
      location: place.location,
    }
  }

  private loadGoogleMaps(): Promise<typeof google.maps> {
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=${this.libraries.join(',')}`
      script.async = true
      script.defer = true
      script.onload = () => (isReady() ? resolve(window.google.maps) : reject(new Error('Google Maps failed to load')))
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
}

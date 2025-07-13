import * as v from 'valibot'

import { loadGoogleMaps } from './loader'
import {
  type FormLocationInput,
  GoogleMapsFormLocationSchema,
  type GoogleMapsPlaceSchema,
} from './schema'

export interface GoogleMapsPlacesOptions {
  apiKey: string
  libraries?: string[]
  requestedLanguage?: string
  requestedRegion?: string
}

export class GoogleMapsPlaces {
  private apiKey: string
  private libraries: string[]
  private maps: typeof google.maps | undefined
  private autocompleteService: google.maps.places.AutocompleteSuggestion | undefined
  public sessionToken: google.maps.places.AutocompleteSessionToken | undefined
  private isLoaded = false
  private requestedLanguage?: string
  private requestedRegion?: string
  private loadPromise?: Promise<void>

  constructor({
    apiKey,
    libraries = ['places'],
    requestedLanguage,
    requestedRegion,
  }: GoogleMapsPlacesOptions) {
    this.apiKey = apiKey
    this.libraries = libraries
    this.requestedLanguage = requestedLanguage
    this.requestedRegion = requestedRegion
  }

  createSessionToken() {
    if (this.maps) {
      this.sessionToken = new this.maps.places.AutocompleteSessionToken()
    }
  }

  destroySessionToken() {
    this.sessionToken = undefined
  }

  async fetchAutocompleteSuggestions(input: string): Promise<Record<string, string>> {
    await this.ensureLoaded()

    if (!this.autocompleteService || !this.sessionToken) {
      throw new Error('Google Maps not loaded')
    }

    const { suggestions } =
      await this.maps!.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: this.sessionToken,
        includedRegionCodes: [this.requestedRegion!],
      })

    return suggestions.reduce<Record<string, string>>((acc, suggestion) => {
      const place = suggestion.placePrediction
      if (place?.placeId && place.text) {
        acc[place.placeId] = place.text.toString()
      }
      return acc
    }, {})
  }

  async fetchPlaceDetails(placeId: string): Promise<FormLocationInput | undefined> {
    await this.ensureLoaded()

    if (!this.maps) {
      throw new Error('Google Maps not loaded')
    }

    const place = new this.maps.places.Place({
      id: placeId,
      requestedLanguage: this.requestedLanguage,
      requestedRegion: this.requestedRegion,
    })

    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'addressComponents', 'location'],
    })

    const rawData = {
      name: place.displayName,
      formattedAddress: place.formattedAddress,
      addressComponents: place.addressComponents,
      location: {
        lat: place.location?.lat(),
        lng: place.location?.lng(),
      },
    }

    try {
      return v.parse(GoogleMapsFormLocationSchema, {
        ...rawData,
        addressId: placeId,
      })
    } catch (error) {
      console.error('Validation failed:', error)
      return undefined
    }
  }

  private ensureLoaded(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        this.maps = await loadGoogleMaps(
          this.apiKey,
          this.libraries,
          this.requestedLanguage,
          this.requestedRegion,
        )
        this.autocompleteService = new this.maps.places.AutocompleteSuggestion()
        this.sessionToken = new this.maps.places.AutocompleteSessionToken()
        this.isLoaded = true
      })()
    }
    return this.loadPromise
  }
}

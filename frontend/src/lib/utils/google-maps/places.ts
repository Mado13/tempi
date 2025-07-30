import * as v from 'valibot'

import { getErrorMessage } from '$lib/i18n/errors.svelte'

import { loadGoogleMaps } from './loader'
import { type FormLocationInput, GoogleMapsFormLocationSchema } from './schema'

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

  async fetchAutocompleteSuggestions(input: string): Promise<Array<{ id: string; label: string }>> {
    await this.ensureLoaded()

    if (!this.autocompleteService || !this.sessionToken) {
      throw new Error(getErrorMessage('GMAPS_NOT_LOADED'))
    }

    const { suggestions } =
      await this.maps!.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: this.sessionToken,
        includedRegionCodes: [this.requestedRegion!],
      })

    return suggestions
      .map((suggestion) => {
        const place = suggestion.placePrediction
        if (place?.placeId && place.text) {
          return { id: place.placeId, label: place.text.toString() }
        }
        return null
      })
      .filter((item): item is { id: string; label: string } => item !== null)
  }

  async fetchPlaceDetails(placeId: string): Promise<FormLocationInput | undefined> {
    await this.ensureLoaded()

    if (!this.maps) {
      throw new Error(getErrorMessage('GMAPS_NOT_LOADED'))
    }

    const place = new this.maps.places.Place({
      id: placeId,
      requestedLanguage: this.requestedLanguage,
      requestedRegion: this.requestedRegion,
    })

    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'addressComponents', 'location', 'types'],
    })

    const locality = place.addressComponents?.find((c) => c.types.includes('locality'))?.longText

    const district = place.addressComponents?.find((c) =>
      c.types.includes('administrative_area_level_1'),
    )?.longText

    const rawData = {
      name: place.displayName,
      formattedAddress: place.formattedAddress,
      locality,
      district,
      location: {
        lat: place.location?.lat(),
        lng: place.location?.lng(),
      },
      types: place.types,
    }

    try {
      return v.parse(GoogleMapsFormLocationSchema, {
        ...rawData,
        googlePlaceId: placeId,
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

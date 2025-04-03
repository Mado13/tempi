import type { InertiaForm } from '@inertiajs/svelte'
import { m } from '../../paraglide/messages.js'

export function handleInputValidation(event: Event, form: InertiaForm<Record<string, any>>) {
  const input = event.target as HTMLInputElement

  if (input) {
    const inputName = input.name

    if (inputName) {
      if (input.validity.badInput) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.customError) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.patternMismatch) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.rangeOverflow) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.rangeUnderflow) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.stepMismatch) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.tooLong) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.tooShort) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.typeMismatch) {
        form.setError(inputName, m.login_welcome_title())
      } else if (input.validity.valueMissing) {
        form.setError(inputName, m.login_welcome_title())
      } else {
        form.setError(inputName, m.login_welcome_title())
      }
    }
  }
}

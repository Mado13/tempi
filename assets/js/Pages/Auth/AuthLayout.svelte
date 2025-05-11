<script lang="ts">
let { children } = $props()
import { Keyboard } from '@capacitor/keyboard'

Keyboard.addListener('keyboardWillShow', () => {
  document.ontouchmove = e => e.preventDefault()
})
</script>

<div class="login-container">
  <div class="login-card">
    {@render children()}
  </div>
</div>

<style lang="scss">
$primary-color: #4f46e5;
$primary-color-dark: #4338ca;
$error-color: #ef4444;
$text-dark: #1a1a1a;
$text-light: #666;
$border-color: #ddd;
$bg-gradient-start: #f5f7fa;
$bg-gradient-end: #c3cfe2;
$white: white;
$box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
$focus-shadow: 0 0 0 0.125rem rgba(79, 70, 229, 0.2);
$transition-speed: 0.2s;

// Mobile-first base styles
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, $bg-gradient-start 0%, $bg-gradient-end 100%);
  padding: 5vw;
  width: 100%;
  transition: padding-bottom 0.3s ease-in-out;
}

.login-card {
  max-width: 400px;
  width: 100%;
  background: $white;
  border-radius: 1.5vw;
  padding: 5vw;
  box-shadow: $box-shadow;
  margin-top: auto;
  margin-bottom: auto;

  :global {
    h1 {
      font-size: clamp(1.25rem, 5vw, 1.5rem);
      font-weight: 600;
      text-align: center;
      margin-bottom: 4vw;
      color: $text-dark;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 3vw;

      input {
        padding: 2.5vw;
        border: 1px solid $border-color;
        border-radius: 1vw;
        font-size: clamp(0.875rem, 4vw, 1rem);
        transition: border-color $transition-speed;
        width: 100%;
        appearance: none;
        -webkit-appearance: none;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: $focus-shadow;
        }

        &.error {
          border-color: $error-color;
        }

        &[dir='rtl'] {
          direction: rtl;
        }
        &[dir='ltr'] {
          direction: ltr;
        }
      }

      .form-error {
        color: $error-color;
        margin-top: -1.5vw;
        font-size: clamp(0.75rem, 3.5vw, 0.875rem);
        min-height: clamp(0.75rem, 3.5vw, 0.875rem);
        line-height: clamp(0.75rem, 3.5vw, 0.875rem);
        visibility: hidden;
        &:empty {
          visibility: hidden;
        }
        &:not(:empty) {
          visibility: visible;
        }
        &.hidden {
          visibility: hidden;
        }
      }

      > button[type='submit'] {
        padding: 2.5vw;
        background: $primary-color;
        color: $white;
        border: none;
        border-radius: 1vw;
        font-size: clamp(0.875rem, 4vw, 1rem);
        font-weight: 500;
        cursor: pointer;
        transition: background $transition-speed;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        min-height: 11vw;

        &:hover:not(:disabled) {
          background: $primary-color-dark;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .remember-me label {
        min-height: 11vw;
        display: flex;
        align-items: center;
      }
    }

    a {
      display: inline-block;
      padding: 2vw 0;
      min-height: 11vw;
      color: $primary-color;
      text-decoration: none;
    }
  }
}

// Larger screens adjustments
@media (min-width: 480px) {
  .login-card {
    max-width: 400px; // Keep a max-width in px for desktop
    padding: 2rem;
    border-radius: 0.5rem;
  }

  :global {
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }

    form {
      gap: 1rem;

      input {
        padding: 0.75rem;
        font-size: 1rem;
      }

      .form-error {
        margin-top: -0.5rem;
      }

      > button[type='submit'] {
        padding: 0.85rem;
        min-height: 44px;
      }

      .remember-me label {
        min-height: 44px;
      }
    }

    a {
      padding: 0.5rem 0;
      min-height: 44px;
    }
  }
}
</style>

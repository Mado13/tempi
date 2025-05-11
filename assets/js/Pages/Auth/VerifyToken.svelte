<script lang="ts">
import { m } from '$paraglide/messages'
import { useForm } from '@inertiajs/svelte'
import { PinInput, REGEXP_ONLY_DIGITS, type PinInputRootSnippetProps } from 'bits-ui'
import AuthLayout from './AuthLayout.svelte'

const { phoneNumber, postPath } = $props()

const form = useForm({
  code: '',
  phoneNumber: phoneNumber,
})

type CellProps = PinInputRootSnippetProps['cells'][0]

function submit() {
  $form.post(postPath, { onStart: () => $form.reset('code') })
}
</script>

<AuthLayout>
  <h1>{m.verify_code_title()}</h1>
  <form dir="ltr" id="code-verification-form">
    <PinInput.Root
      bind:value={$form.code}
      onComplete={submit}
      maxlength={6}
      pattern={REGEXP_ONLY_DIGITS}
      oninput={() => $form.clearErrors('code')}
    >
      {#snippet children({ cells })}
        <div class="pin-group">
          {#each cells.slice(0, 3) as cell}
            {@render Cell(cell)}
          {/each}
        </div>

        <div class="divider">
          <div></div>
        </div>

        <div class="pin-group">
          {#each cells.slice(3, 6) as cell}
            {@render Cell(cell)}
          {/each}
        </div>
      {/snippet}
    </PinInput.Root>
    <div class="form-error" class:hidden={!$form.errors.code}>{$form.errors.code}</div>
  </form>
</AuthLayout>

{#snippet Cell(cell: CellProps)}
  <PinInput.Cell {cell} class="pin-cell" data-error={$form.errors.code ? 'true' : 'false'}>
    {#if cell.char !== null}
      <div class="pin-char">
        {cell.char}
      </div>
    {/if}
    {#if cell.hasFakeCaret}
      <div class="caret">
        <div class="caret-line"></div>
      </div>
    {/if}
  </PinInput.Cell>
{/snippet}

<style lang="scss">
$primary-color: #4338ca;
$border-color: rgba(0, 0, 0, 0.12);
$border-color-hover: rgba(0, 0, 0, 0.2);
$shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

form {
  .form-error.hidden {
    visibility: hidden;
  }
  .form-error {
    align-self: center;
  }
}

:global {
  form#code-verification-form [data-pin-input-root] {
    display: flex;
    align-items: center;
    justify-content: center;
    color: red;
    width: 100%;

    &:has(:disabled) {
      opacity: 0.3;
    }

    .pin-group {
      display: flex;
    }

    .divider {
      display: flex;
      width: 1.75rem;
      align-items: center;
      justify-content: center;

      div {
        height: 0.125rem;
        width: 0.5rem;
        border-radius: 9999px;
        background-color: rgba(0, 0, 0, 0.2);
      }
    }
  }

  [data-pin-input-cell] {
    position: relative;
    height: 2.75rem;
    width: 2.75rem;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 75ms;
    border: 1px solid $border-color;
    color: #000;
    outline: none;
    background-color: white;
    margin: 0 0.1rem;
    border-radius: 0.25rem;
    box-shadow: $shadow;

    .pin-char {
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    &[data-active]:not([data-error='true']) {
      border-color: $primary-color;
      box-shadow: 0 0 0 1px $primary-color;
    }

    &[data-error='true'] {
      border-color: red;
    }
  }

  .caret {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .caret-line {
    height: 1.5rem;
    width: 1px;
    background-color: $primary-color;
    animation: caret-blink 1s step-end infinite;
  }
}

@keyframes caret-blink {
  from,
  to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>

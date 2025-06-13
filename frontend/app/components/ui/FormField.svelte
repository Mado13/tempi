<script lang="ts">
let {
  label,
  id,
  type = 'text',
  value = $bindable(),
  error = null,
  placeholder = '',
  required = false,
  ...restProps
} = $props()
</script>

<div class="input-group">
  <label for={id}>{label}{required ? '*' : ''}</label>
  <input {id} {type} {placeholder} bind:value class:error={!!error} {...restProps} />
  <div class="form-errors">{error}</div>
</div>

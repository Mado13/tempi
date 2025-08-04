<div>
  <IconLineMdLoadingTwotoneLoop />
</div>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;

    :global(svg) {
      width: 32px;
      height: 32px;
      color: var(--color-primary);

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    }
  }
</style>

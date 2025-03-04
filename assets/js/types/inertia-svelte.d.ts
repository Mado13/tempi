declare module "@inertiajs/inertia-svelte" {
  import { ComponentType } from "svelte";
  import { InertiaAppOptions } from "@inertiajs/inertia";

  export function createInertiaApp<TProps = any>(
    options: InertiaAppOptions<TProps, ComponentType>
  ): void;
}

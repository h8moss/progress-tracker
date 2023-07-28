<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { KeyboardEventHandler } from "svelte/elements";

  const dispatch = createEventDispatcher();

  const handleKey: KeyboardEventHandler<HTMLElement> = (e) => {
    const key = e.key;

    const ctrl = e.ctrlKey;
    const alt = e.altKey;
    const shift = e.shiftKey;

    console.log({ key, ctrl, alt, shift });

    if (ctrl || alt || shift) {
      e.preventDefault();

      dispatch(key.toUpperCase(), { ctrl, alt, shift });
    }
  };
</script>

<svelte:body on:keydown={handleKey} />
<slot />

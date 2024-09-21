<script lang="ts">
  import type { NodeTheme } from "../../ProgressNode/types";

  export let theme: NodeTheme;
  export let colorLabel: string;
  export let backgroundColor: string;
</script>

<div
  style:--bg-color={backgroundColor}
  style:--text-color={theme.textColor}
  style:--darken-color="{theme.darkenColor[0]}, {theme.darkenColor[1]}, {theme
    .darkenColor[2]}"
  style:--text-color-b={theme.textColorB}
  style:--accent={theme.highlightColorA}
  style:--accent-b={theme.highlightColorB}
  style:--label-color={colorLabel}
>
  <slot />
</div>

<style>
  div {
    background-color: var(--bg-color, transparent);
  }
</style>

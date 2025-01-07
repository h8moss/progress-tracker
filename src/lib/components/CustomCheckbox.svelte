<script lang="ts">
  import { tweened } from "svelte/motion";
  import LogoSvg from "./LogoSVG.svelte";
  import { cubicInOut } from "svelte/easing";

  export let checked = false;
  export let stopColorA = "#2d99fc";
  export let stopColorB = "#2a87ff";

  const progress = tweened(0, {
    duration: 200,
    easing: cubicInOut,
  });

  $: $progress = checked ? 100 : 0;
</script>

<div class="logo">
  <LogoSvg offset={0} progress={$progress} {stopColorA} {stopColorB} />
</div>

<style>
  div.logo {
    padding: 0.25rem;
    width: 20px;
    display: flex;
    justify-content: center;
    cursor: pointer;
  }
</style>

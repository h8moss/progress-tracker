<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import LogoSvg from "./LogoSVG.svelte";
  import { DEFAULT_THEME } from "../ProgressNode/constants";

  /** Number from 0 to 100 describing the percentage of advancement */
  export let progress: number = 50;
  export let showLabel: boolean = false;

  let offset = writable(0);
  let rate = -0.5;

  let timer: NodeJS.Timer | null = null;

  onMount(() => {
    timer = setInterval(() => {
      offset.update((v) => (v + rate) % 100);
    }, 20);
  });

  onDestroy(() => {
    if (timer) {
      clearInterval(timer);
    }
  });
</script>

<div class="main">
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <div
    class="center"
    on:mouseover={() => (rate = -1)}
    on:mouseout={() => (rate = -0.5)}
  >
    <LogoSvg
      {progress}
      offset={$offset}
      stopColorA={DEFAULT_THEME.highlightColorA}
      stopColorB={DEFAULT_THEME.highlightColorB}
    />
    <div class:visible={showLabel} class="label">
      <p>{progress.toFixed(2)}%</p>
    </div>
  </div>
</div>

<style>
  .main {
    display: flex;
    flex-direction: column;

    justify-content: center;

    height: 100%;
  }

  .main > div {
    margin: auto;
  }

  .center {
    display: inline-block;
    position: relative;
    width: 20vw;
    height: 20vw;

    display: flex;

    overflow: hidden;

    position: relative;
  }

  .label {
    position: absolute;
    margin: auto;

    width: 100%;
    height: 100%;

    display: flex;

    opacity: 0;
  }

  .label > p {
    margin: auto;

    font-size: 2rem;
    font-weight: bold;
  }

  .label.visible {
    opacity: 1;
  }
</style>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";

  /** Number from 0 to 100 describing the percentage of advancement */
  export let progress: number = 50;
  export let showLabel: boolean = false;

  let offset = writable(0);
  let rate = -0.5;

  let timer: NodeJS.Timer | null = null;

  $: trueProgress = 100 - progress;

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
    <svg viewBox="-5 -5 110 110">
      <defs>
        <linearGradient id="gradient">
          <stop
            offset="5%"
            stop-color="#2f99fc"
            gradientTransform="rotate(199)"
          />
          <stop offset="95%" stop-color="#2a87ff" />
        </linearGradient>
      </defs>
      <mask id="wave-mask">
        <rect x="0" y="0" width="100" height="100" fill="white" />

        <path
          stroke="black"
          fill="black"
          d="M {$offset} {trueProgress} c 20 10, 30 10, 50 0 c 20 -10, 30 -10, 50 0 c 20 10, 30 10, 50 0 c 20 -10, 30 -10, 50 0 l 0 -120 l -250 0 l 0 120"
        />
      </mask>

      <circle
        cx="50"
        cy="50"
        r="50"
        fill="url(#gradient)"
        mask="url(#wave-mask)"
      />

      <circle
        cx="50"
        cy="50"
        r="50"
        stroke="url(#gradient)"
        stroke-width="5"
        fill="transparent"
      />
    </svg>
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

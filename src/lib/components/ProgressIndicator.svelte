<script lang="ts">
  export let progress: number;
  export let maximum = 1;
  export let minimum = 0;
  export let sticky = false;

  $: trueProgress =
    maximum - minimum === 0 ? 1 : (progress - minimum) / (maximum - minimum);
  $: percentage = (trueProgress * 100).toFixed(2);
</script>

<div style:--percent="{percentage}%" class:sticky>
  <p>{percentage}%</p>
</div>

<style>
  div.sticky {
    position: sticky;
    top: 0.5rem;
    --bg: var(--bg-color, white);
    z-index: 99;
  }
  div {
    background: linear-gradient(
      to right,
      var(--accent) 0,
      var(--accent-b) var(--percent),
      var(--bg, transparent) var(--percent)
    );
    min-width: 150px;

    margin: auto 0px;

    display: flex;
    justify-content: center;
    border-radius: 1rem;
    color: var(--text-color-b, black);
    border: 2px solid var(--text-color-b, black);
  }

  p {
    margin: 0px;
  }
</style>

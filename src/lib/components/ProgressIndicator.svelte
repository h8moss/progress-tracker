<script lang="ts">
  export let progress: number;
  export let maximum = 1;
  export let minimum = 0;

  $: trueProgress = (progress - minimum) / (maximum - minimum);
  $: percentage = (trueProgress * 100).toFixed(2);
</script>

<div style:--percent="{percentage}%">
  <p>{percentage}%</p>
</div>

<style>
  div {
    background: linear-gradient(
      to right,
      var(--accent) var(--percent),
      transparent var(--percent)
    );
    min-width: 150px;

    margin: auto 0px;

    display: flex;
    justify-content: center;
    border-radius: 1rem;
    border: 2px solid #2222aa;
  }

  p {
    margin: 0px;
  }
</style>

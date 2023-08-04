<script lang="ts">
  import { v4 } from "uuid";

  export let offset = 0;
  export let progress = 0;

  export let stopColorA: string;
  export let stopColorB: string;

  $: trueProgress = 100 - progress;

  const rand = v4();
</script>

<svg viewBox="-5 -5 110 110">
  <defs>
    <linearGradient id="gradient-{rand}">
      <stop
        offset="5%"
        stop-color={stopColorA}
        gradientTransform="rotate(199)"
      />
      <stop offset="95%" stop-color={stopColorB} />
    </linearGradient>
  </defs>
  <mask id="wave-mask-{rand}">
    <rect x="0" y="0" width="100" height="100" fill="white" />

    <path
      stroke="black"
      fill="black"
      d="M {offset} {trueProgress} c 20 10, 30 10, 50 0 c 20 -10, 30 -10, 50 0 c 20 10, 30 10, 50 0 c 20 -10, 30 -10, 50 0 l 0 -120 l -250 0 l 0 120"
    />
  </mask>

  <circle
    cx="50"
    cy="50"
    r="50"
    fill="url(#gradient-{rand})"
    mask="url(#wave-mask-{rand})"
  />

  <circle
    cx="50"
    cy="50"
    r="50"
    stroke="url(#gradient-{rand})"
    stroke-width="5"
    fill="transparent"
  />
</svg>

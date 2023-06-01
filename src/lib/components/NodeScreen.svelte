<script lang="ts">
  import { getContext } from "svelte";
  import type { NodeManager } from "../types";
  import { derived } from "svelte/store";
  import NodeView from "./NodeView.svelte";
  import ProgressIndicator from "./ProgressIndicator.svelte";
  import { getTotalWeight, getWeightedProgress } from "../ProgressNode/util";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { NodeConfiguration } from "../ProgressNode/types";

  const { needsSave, progressNode } = getContext<NodeManager>("nodeManager");

  const node = derived(progressNode, (n) => n!);

  const defaultConfig: Required<NodeConfiguration> = {
    weightInterpretation: "none",
  };

  $: weightedProgress = getWeightedProgress($node);
  const tweenWeightedProgress = tweened(weightedProgress, {
    duration: 200,
    easing: cubicOut,
  });

  $: tweenWeightedProgress.set(weightedProgress);

  let changeCounter = 0;
</script>

{#key changeCounter}
  <div class="main">
    <h1>
      {$node.title}
    </h1>

    <ProgressIndicator
      progress={$tweenWeightedProgress}
      maximum={getTotalWeight($node)}
      sticky
    />

    <div class="node-view">
      <NodeView
        {defaultConfig}
        {node}
        on:changed={(event) => {
          changeCounter++;
          $progressNode = event.detail;
          $needsSave = true;
        }}
        canDelete={false}
        headless
        path={`//${$node.title}`}
      />
    </div>
  </div>
{/key}

<style>
  .main {
    display: flex;
    flex-direction: column;

    overflow: auto;
    height: 100%;

    padding: 1rem;
  }

  .node-view {
    padding: 2rem;
  }
</style>

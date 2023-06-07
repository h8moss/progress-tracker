<script lang="ts">
  import { getContext } from "svelte";
  import type { NodeManager } from "../types";
  import { derived, writable } from "svelte/store";
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

  const initialTitle = $node.title;

  const titleStore = writable($node.title);

  $: $titleStore = $node.title;
  $: {
    $progressNode = { ...$progressNode, title: $titleStore };
    $needsSave = true;
  }

  $: weightedProgress = getWeightedProgress($node);
  const tweenWeightedProgress = tweened(weightedProgress, {
    duration: 200,
    easing: cubicOut,
  });

  $: tweenWeightedProgress.set(weightedProgress);

  $: if ($node.title !== initialTitle) $needsSave = true;

  $: console.log({ $node });
</script>

<!--TODO: Fix item duplication
    When changing the title of a task, the task's path changes with it. This
    tells svelte it should add a new item to the list of tasks. 

    To fix it, give every task a random ID. it's that simple. 
    <!--
    ! If you want to save the ID in the file. make sure to expect some files to 
    ! not have an ID. This will keep backwards compatibility. 
-->

<div class="main">
  <h1 bind:textContent={$titleStore} contenteditable />

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
        $progressNode = event.detail;
        $needsSave = true;
        console.log({ $progressNode });
      }}
      canDelete={false}
      headless
      path={`//${$node.title}`}
    />
  </div>
</div>

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
    flex: 1;
  }
</style>

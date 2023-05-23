<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { derived, type Readable } from "svelte/store";
  import ProgressIndicator from "./ProgressIndicator.svelte";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { ProgressNode } from "../ProgressNode";
  import { getTotalWeight, getWeightedProgress } from "../ProgressNode/util";
  import type { NodeConfiguration } from "../ProgressNode/types";
  import interpretWeight from "../util/interpretWeight";

  export let headless: boolean = false;
  export let node: Readable<ProgressNode>;
  export let defaultConfig: Required<NodeConfiguration>;

  let showChildren = true;

  const dispatch = createEventDispatcher<{ changed: ProgressNode }>();

  const onClick = () => {
    if ($node.children) showChildren = !showChildren;
    if ($node.isDone !== undefined) {
      dispatch("changed", { ...$node, isDone: !$node.isDone });
    }
  };

  const onChildChanged = (
    index: number,
    newChild: CustomEvent<ProgressNode>
  ) => {
    console.log({ newChild, $node });
    if ($node.children) {
      const copy = { ...$node };
      copy.children![index] = newChild.detail;
      dispatch("changed", copy);
    }
  };

  $: weightedProgress = getWeightedProgress($node);
  const tweenWeightedProgress = tweened(weightedProgress, {
    duration: 200,
    easing: cubicOut,
  });

  $: tweenWeightedProgress.set(weightedProgress);

  $: configuration = {
    ...defaultConfig,
    ...$node.configuration,
  } as Required<NodeConfiguration>;

  $: interpretedProgress = interpretWeight({
    weight: $tweenWeightedProgress,
    weightInterpretation: configuration.weightInterpretation,
  });

  $: interpretedWeight = interpretWeight({
    weight: getTotalWeight($node),
    weightInterpretation: configuration.weightInterpretation,
  });

  $: {
    console.log({
      configuration,
    });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="content" on:click|stopPropagation={onClick}>
  <div class="head" class:headless>
    <div class="title">
      {#if $node.isDone !== undefined}<input
          type="checkbox"
          bind:checked={$node.isDone}
        />
      {/if}
      <p>{$node.title}</p>
    </div>
    <ProgressIndicator
      progress={$tweenWeightedProgress}
      maximum={getTotalWeight($node)}
    />
  </div>
  <div class="weights">
    <p>{interpretedProgress}</p>
    <p>
      {interpretedWeight}
    </p>
  </div>
  {#if $node.children && showChildren}
    <div class="children">
      {#each $node.children as _, index}
        <svelte:self
          node={derived(node, (node) => node.children && node.children[index])}
          on:changed={(newChild) => onChildChanged(index, newChild)}
          defaultConfig={configuration}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .content {
    --background-color-opacity: 0;

    display: flex;
    flex-direction: column;

    background-color: rgba(0, 0, 0, var(--background-color-opacity));
    padding: 0.5rem;
    margin: 0.25rem;
    border-radius: 0.25rem;

    transition: background 200ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  .content:hover {
    --background-color-opacity: 0.05;
  }

  .head {
    display: flex;
    justify-content: space-between;
  }

  .head.headless {
    display: none;
  }

  .title {
    display: flex;
  }

  .weights {
    display: flex;
    justify-content: space-between;

    font-size: 0.75rem;
    border-bottom: rgba(0, 0, 0, 0.7) 1px solid;
  }

  .weights > p {
    margin: 0px;
  }

  .children {
    margin-left: 2rem;
  }
</style>

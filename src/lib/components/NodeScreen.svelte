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
  import SettingsIcon from "./SettingsIcon.svelte";
  import type { ConfigurationDialogContext } from "../types";

  const { needsSave, progressNode } = getContext<NodeManager>("nodeManager");

  const node = derived(progressNode, (n) => n!);

  const defaultConfig: Required<NodeConfiguration> = {
    weightInterpretation: "none",
  };

  const initialTitle = $node.title;

  const titleStore = writable($node.title);

  let isTitleHovered = false;

  const configurationDialogCtx = getContext<ConfigurationDialogContext>(
    "configuration-dialog"
  );

  $: $titleStore = $node.title;
  $: {
    if ($progressNode) {
      $progressNode = { ...$progressNode, title: $titleStore };
      $needsSave = true;
    }
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

<div class="main">
  <div
    class="title-div"
    on:mouseenter={() => (isTitleHovered = true)}
    on:mouseleave={() => (isTitleHovered = false)}
  >
    <div style:width="30px" />
    <h1 bind:textContent={$titleStore} contenteditable />
    <button
      class="settings-button"
      on:click={() => {
        if ($progressNode) {
          configurationDialogCtx.open(
            {
              ...defaultConfig,
              ...$progressNode.configuration,
            },
            (result) => {
              if ($progressNode) {
                $progressNode.configuration = result;
                $needsSave = true;
              }
            }
          );
        }
      }}
    >
      <SettingsIcon size={30} opacity={isTitleHovered ? 0.5 : 0} />
    </button>
  </div>

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

  .title-div {
    display: flex;
    justify-content: center;
  }

  .settings-button {
    margin: auto 0px;
    background-color: transparent;
    border: none;
  }
</style>

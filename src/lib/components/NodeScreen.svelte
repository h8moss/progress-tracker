<script lang="ts">
  import { getContext } from "svelte";
  import type { NodeManager } from "../types";
  import { derived, writable } from "svelte/store";
  import NodeView from "./NodeView";
  import ProgressIndicator from "./ProgressIndicator.svelte";
  import { getTotalWeight, getWeightedProgress } from "../ProgressNode/util";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import type { NodeConfiguration } from "../ProgressNode/types";
  import SettingsIcon from "./SettingsIcon.svelte";
  import type { ConfigurationDialogContext } from "../types";
  import { DEFAULT_THEME } from "../ProgressNode/constants";
  import { getWeightInterpretations } from "../util";

  const { needsSave, progressNode } = getContext<NodeManager>("nodeManager");

  const node = derived(progressNode, (n) => n!);

  const defaultConfig: Required<NodeConfiguration> = {
    weightInterpretation: getWeightInterpretations()[0],
    colorLabel: "transparent",
    theme: DEFAULT_THEME,
  };

  const initialTitle = $node.title;

  const titleStore = writable($node.title);

  let isTitleHovered = false;

  const configurationDialogCtx = getContext<ConfigurationDialogContext>(
    "configuration-dialog",
  );

  $: $titleStore = $node.title;
  $: {
    if ($progressNode) {
      console.log("NEEDED SAVE 4 + " + $progressNode.title === $titleStore);
      $needsSave = $progressNode.title === $titleStore;
      $progressNode = { ...$progressNode, title: $titleStore };
    }
  }

  $: weightedProgress = getWeightedProgress($node);
  const tweenWeightedProgress = tweened(weightedProgress, {
    duration: 200,
    easing: cubicOut,
  });

  $: tweenWeightedProgress.set(weightedProgress);

  $: if ($node.title !== initialTitle) {
    console.log("NEEDED SAVE 3");
    $needsSave = true;
  }

  $: configuration = {
    ...structuredClone(defaultConfig),
    ...structuredClone($progressNode?.configuration || {}),
  };

  $: console.log({ configuration });
  $: console.log({ node: $node });
</script>

<div
  class="main"
  style:--bg-color={configuration.theme.backgroundColor}
  style:--text-color={configuration.theme.textColor}
  style:--darken-color="{configuration.theme.darkenColor[0]}, {defaultConfig
    .theme.darkenColor[1]}, {configuration.theme.darkenColor[2]}"
  style:--text-color-b={configuration.theme.textColorB}
  style:--accent={configuration.theme.highlightColorA}
  style:--accent-b={configuration.theme.highlightColorB}
>
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
            false,
            (result) => {
              if ($progressNode) {
                $progressNode.configuration = result;

                console.log("NEEDED SAVE 5");
                $needsSave = true;
              }
            },
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
      isLast={() => false}
      isFirst={() => false}
      node={$node}
      on:changed={(event) => {
        console.log("I was changed");
        $progressNode = event.detail;

        console.log("NEEDED SAVE 6");
        $needsSave = true;
        console.log({ $progressNode });
      }}
      canDelete={false}
      headless
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

    background-color: var(--bg-color, #fff);
    color: var(--text-color, #000);
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

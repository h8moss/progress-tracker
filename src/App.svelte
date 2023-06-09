<script lang="ts">
  import { getMatches } from "@tauri-apps/api/cli";
  import type { NodeManager } from "./lib/types";
  import { onMount, setContext, onDestroy } from "svelte";
  import { nodeFromJsonPath } from "./lib/ProgressNode/util";
  import { writable } from "svelte/store";
  import LoadingScreen from "./lib/components/LoadingScreen.svelte";
  import WelcomeScreen from "./lib/components/WelcomeScreen.svelte";
  import NodeScreen from "./lib/components/NodeScreen.svelte";
  import { appWindow } from "@tauri-apps/api/window";
  import type { ProgressNode } from "./lib/ProgressNode";
  import { appEventListener } from "./lib/util";
  import ContextMenuHandler from "./lib/components/ContextMenuHandler.svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut } from "svelte/easing";

  const isLoading = tweened<number | null>(50, {
    duration: 200,
    easing: cubicInOut,
    interpolate: (a, b) => (t) => (a ?? 100) * (1 - t) + (b ?? 100) * t,
  });
  const needsSave = writable(false);
  const path = writable<string | null>(null);
  const progressNode = writable<ProgressNode | null>(null);

  setContext<NodeManager>("nodeManager", {
    needsSave,
    path,
    progressNode,
  });

  setContext("loading-screen", isLoading);

  let unlisten: (() => void) | null = null;

  onMount(async () => {
    const matches = await getMatches();
    if (matches.args.file.value) {
      $isLoading = 25;
      try {
        $path = matches.args.file.value as string;
        $progressNode = await nodeFromJsonPath($path);
        $isLoading = 90;
      } catch (e) {
        console.error(e);
      }
    }
    $isLoading = null;

    unlisten = await appEventListener({
      progressNode,
      isLoading,
      path,
      needsSave,
    });
  });

  onDestroy(() => {
    if (unlisten) unlisten();
  });

  $: {
    appWindow.setTitle(
      ($progressNode?.title ?? "Welcome") +
        ($needsSave ? "*" : "") +
        ($path ? ` - ${$path}` : "")
    );
  }
</script>

<ContextMenuHandler>
  {#if $isLoading !== null}
    <LoadingScreen progress={$isLoading} showLabel />
  {:else if $progressNode}
    <NodeScreen />
  {:else}
    <WelcomeScreen />
  {/if}
</ContextMenuHandler>

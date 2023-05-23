<script lang="ts">
  import { getMatches } from "@tauri-apps/api/cli";
  import type { NodeManager } from "./lib/types";
  import { onMount, setContext } from "svelte";
  import { nodeFromJsonPath } from "./lib/ProgressNode/util";
  import { writable } from "svelte/store";
  import LoadingScreen from "./lib/components/LoadingScreen.svelte";
  import WelcomeScreen from "./lib/components/WelcomeScreen.svelte";
  import NodeScreen from "./lib/components/NodeScreen.svelte";
  import { appWindow } from "@tauri-apps/api/window";
  import type { ProgressNode } from "./lib/ProgressNode";

  const isLoading = writable(true);
  const needsSave = writable(false);
  const path = writable<string | null>(null);
  const progressNode = writable<ProgressNode | null>(null);

  setContext<NodeManager>("nodeManager", {
    needsSave,
    path,
    progressNode,
  });

  setContext("loading-screen", isLoading);

  onMount(async () => {
    const matches = await getMatches();
    if (matches.args.file) {
      try {
        $path = matches.args.file.value as string;
        $progressNode = await nodeFromJsonPath($path);
      } catch (e) {
        console.error(e);
      }
    }
    $isLoading = false;
  });

  $: {
    appWindow.setTitle(
      ($progressNode?.title ?? "Welcome") +
        ($needsSave ? "*" : "") +
        ($path ? ` - ${$path}` : "")
    );
  }
</script>

{#if $isLoading}
  <LoadingScreen />
{:else if $progressNode}
  <NodeScreen />
{:else}
  <WelcomeScreen />
{/if}

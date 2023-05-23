<script lang="ts">
  import { getMatches } from "@tauri-apps/api/cli";
  import type { NodeManager, ProgressNode } from "./lib/types";
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount, setContext } from "svelte";
  import { nodeFromJson, nodeFromJsonPath, promiseTimeout } from "./lib/util";
  import { writable } from "svelte/store";
  import LoadingScreen from "./lib/components/LoadingScreen.svelte";
  import WelcomeScreen from "./lib/components/WelcomeScreen.svelte";

  let isLoading = true;
  const needsSave = writable(false);
  const path = writable<string | null>(null);
  const progressNode = writable<ProgressNode | null>(null);

  setContext<NodeManager>("nodeManager", {
    needsSave,
    path,
    progressNode,
  });

  onMount(async () => {
    const matches = await getMatches();
    if (matches.args.path) {
      $path = matches.args.path.value as string;
      try {
        $progressNode = await nodeFromJsonPath($path);
      } catch (_) {}
    }
    isLoading = false;
  });
</script>

{#if isLoading}
  <LoadingScreen />
{:else if $progressNode}
  <p>{$progressNode.title}</p>
{:else}
  <WelcomeScreen />
{/if}

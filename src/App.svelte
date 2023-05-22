<script lang="ts">
  import { getMatches } from "@tauri-apps/api/cli";
  import type { NodeManager, ProgressNode } from "./lib/types";
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount, setContext } from "svelte/types/runtime/internal/lifecycle";
  import { nodeFromJson } from "./lib/util";
  import { writable } from "svelte/store";
  import LoadingScreen from "./lib/components/LoadingScreen.svelte";

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
      const content = (await invoke("read_file", { path: $path })) as string;
      try {
        const json = JSON.parse(content);
        $progressNode = nodeFromJson(json);
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
  <button>LMAO</button>
{/if}

<script lang="ts">
  import { invoke } from "@tauri-apps/api";
  import { nodeFromJsonPath } from "../ProgressNode/util";
  import { getContext } from "svelte";
  import type { NodeManager } from "../types";

  const nodeManager = getContext<NodeManager>("nodeManager");

  $: path = nodeManager.path;
  $: progressNode = nodeManager.progressNode;

  let recent = invoke("read_file", { path: "./recent.json" }).then((value) => {
    console.log({ value });
    return JSON.parse((value as string) || "[]");
  });
</script>

<div>
  {#await recent}
    <p>...</p>
  {:then recent}
    {#each recent as item}
      <button
        on:click={async () => {
          $progressNode = await nodeFromJsonPath(item.path);
          $path = item.path;
        }}
      >
        <p>{item.title}</p>
        <p class="path">{item.path}</p>
      </button>
    {/each}
    {#if recent.length === 0}
      <p>No recent Items</p>
    {/if}
  {/await}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow-x: hidden;
    overflow-y: auto;
    justify-content: space-between;
  }

  div button {
    background-color: transparent;
    border: none;
    padding: 0.5rem;
    border-bottom: #202020 1px solid;
    margin: auto;
    border-radius: 0.2rem;
  }

  p {
    text-align: left;
    margin: 0px;
    font-size: 1rem;
  }

  p.path {
    font-size: 0.75rem;
    color: #808080;
  }

  div button:hover {
    border-color: var(--accent);
    background-color: #eee;
  }
</style>

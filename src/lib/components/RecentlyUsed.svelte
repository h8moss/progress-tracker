<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { nodeFromJsonPath } from "../ProgressNode/util";
  import { getContext } from "svelte";
  import type { NodeManager } from "../types";
  import { appDataDir, join } from "@tauri-apps/api/path";
  import { removeData } from "../util";

  const nodeManager = getContext<NodeManager>("nodeManager");

  $: path = nodeManager.path;
  $: progressNode = nodeManager.progressNode;

  let recent: Promise<({ title: string; path: string } | undefined)[]> =
    appDataDir().then((dataDir) =>
      join(dataDir, "\\recent.json").then((path) =>
        invoke("read_file", { path }).then((value) => {
          return JSON.parse((value as string) || "[]");
        })
      )
    );
</script>

<div>
  {#await recent}
    <p>...</p>
  {:then result}
    {#each result as item}
      {#if item === undefined}
        <p class="error">Error, missing file</p>
      {:else}
        <button
          on:click={async () => {
            try {
              $progressNode = await nodeFromJsonPath(item.path);
              $path = item.path;
            } catch (e) {
              console.error(e);
              recent = new Promise((resolve) => {
                resolve(
                  result.map((v) =>
                    v == undefined || v.path === item.path ? undefined : v
                  )
                );
              });
              removeData({ title: item.title, path: item.path });
            }
          }}
        >
          <p>{item.title}</p>
          <p class="path">{item.path}</p>
        </button>
      {/if}
    {/each}
    {#if result.length === 0}
      <p class="no-items">No recent Items</p>
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

    width: 100%;
  }

  p {
    text-align: left;
    margin: 0px;
    font-size: 1rem;
  }

  p.error {
    color: red;
  }

  .no-items {
    text-align: center;
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

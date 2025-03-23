<script lang="ts">
  import { onMount } from "svelte";
  import { check, Update } from "@tauri-apps/plugin-updater";
  import { relaunch } from "@tauri-apps/plugin-process";
  import ProgressIndicator from "./ProgressIndicator.svelte";
  import LogoSvg from "./LogoSVG.svelte";
  import RaisedButton from "./RaisedButton.svelte";

  let updateStatus:
    | "before-check"
    | "idle"
    | "request-update"
    | "updating"
    | "done-updating" = "before-check";

  $: beforeCheck = updateStatus === "before-check";
  $: idle = updateStatus === "idle";
  $: requestUpdate = updateStatus === "request-update";
  $: updating = updateStatus === "updating";
  $: doneUpdating = updateStatus === "done-updating";

  let update: Update | null = null;

  const checkForUpdates = async () => {
    update = await check();
    if (update) {
      updateStatus = "request-update";
    } else {
      updateStatus = "idle";
    }
  };

  onMount(() => {
    if (updateStatus === "before-check") {
      checkForUpdates();
    }
  });

  let downloadProgress = 0;
  let downloadTotal = 1;

  const installUpdate = async () => {
    if (update === null) return;

    updateStatus = "updating";

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          downloadTotal = event.data.contentLength ?? 1;
          break;
        case "Progress":
          downloadProgress += event.data.chunkLength;
          break;
        case "Finished":
          updateStatus = "done-updating";
          break;
      }
    });
  };

  const ignoreUpdate = () => (updateStatus = "idle");
</script>

{#if beforeCheck}
  <div class="logo">
    <LogoSvg
      offset={0}
      progress={50}
      stopColorA="#2d99fc"
      stopColorB="#2a87ff"
    />
    <p>Progress Tracker</p>
  </div>
{:else if idle}
  <slot />
{:else if requestUpdate}
  <div class="version-found">
    <p>New version found! ({update?.version})</p>
    <RaisedButton on:click={installUpdate}>Install now!</RaisedButton>
    <RaisedButton on:click={ignoreUpdate}>Remind me later</RaisedButton>
  </div>
{:else if updating}
  <div class="logo">
    <LogoSvg
      offset={0}
      progress={100 * (downloadProgress / downloadTotal)}
      stopColorA="#2d99fc"
      stopColorB="#2a87ff"
    />
  </div>
{:else if doneUpdating}
  <div class="version-found">
    <p>Update finished, please restart the application</p>
    <RaisedButton on:click={() => relaunch()}>Restart</RaisedButton>
  </div>
{/if}

<style>
  .logo {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 200px;
    height: 100%;
    margin: auto;

    text-align: center;
  }

  .version-found {
    display: flex;
    flex-direction: column;

    padding: 2rem;
  }
</style>

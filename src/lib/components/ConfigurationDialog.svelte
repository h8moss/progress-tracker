<script lang="ts">
  import { setContext } from "svelte";
  import {
    DEFAULT_THEME,
    WEIGHT_INTERPRETATIONS,
  } from "../ProgressNode/constants";
  import type { NodeConfiguration } from "../ProgressNode/types";
  import type { ConfigurationDialogContext } from "../types";
  import getThemes from "../util/getThemes";

  let currentValues: Required<NodeConfiguration> = {
    weightInterpretation: "none",
    colorLabel: "transparent",
    theme: DEFAULT_THEME,
  };

  let onDone: (result: Required<NodeConfiguration>) => unknown = () => {};

  let dialog: HTMLDialogElement;

  setContext<ConfigurationDialogContext>("configuration-dialog", {
    open: (config, callback) => {
      currentValues = config;
      onDone = callback;

      dialog.showModal();
    },
  });
</script>

<dialog bind:this={dialog}>
  <form method="dialog">
    <div class="content">
      <label for="weight-interpretation"
        >Weight interpretation:
        <select
          name="weight-interpretation"
          bind:value={currentValues.weightInterpretation}
        >
          {#each WEIGHT_INTERPRETATIONS as weightInterpretation}
            <option value={weightInterpretation}>{weightInterpretation}</option>
          {/each}
        </select>
      </label>
      <label for="theme"
        >Theme
        {#await getThemes()}
          <p>...</p>
        {:then themes}
          <select name="theme" bind:value={currentValues.theme}>
            {#each themes as theme}
              <option value={theme}>{theme.name}</option>
            {/each}
          </select>
        {/await}
      </label>
      <label for="label-color">
        Label: <select
          name="label-color"
          class="label-color-select"
          bind:value={currentValues.colorLabel}
        >
          <option value="transparent"> None</option>
          <option value="#5555ff"> Blue</option>
          <option value="#ff2222"> Red</option>
          <option value="#ffff00"> Yellow</option>
          <option value="#ff8800"> Orange</option>
          <option value="#9900ff"> Purple</option>
        </select>
      </label>
    </div>

    <div class="buttons">
      <button
        type="button"
        on:click={() => {
          onDone(currentValues);
          dialog.close();
        }}
      >
        Submit
      </button>
      <button type="button" on:click={() => dialog.close()}>Cancel</button>
    </div>
  </form>
</dialog>

<slot />

<style>
  select.label-color-select option {
    display: flex;
  }

  div.content {
    display: flex;
    flex-direction: column;
  }

  dialog {
    border: none;
    border-radius: 0.5rem;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    padding-top: 1rem;

    justify-content: space-around;
  }

  button {
    border: none;
    color: white;
    background-color: #2f99fc;
    font-weight: bold;
    padding: 0.5rem;
    border-radius: 10px;
  }

  button:hover {
    background-color: #2a87ff;
  }
</style>

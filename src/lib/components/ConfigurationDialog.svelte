<script lang="ts">
  import { setContext } from "svelte";
  import { DEFAULT_THEME } from "../ProgressNode/constants";
  import type { NodeConfiguration } from "../ProgressNode/types";
  import type { ConfigurationDialogContext } from "../types";
  import { getThemes } from "../util";
  import { getWeightInterpretations } from "../util";
  import RaisedButton from "./RaisedButton.svelte";

  let currentValues: NodeConfiguration = {};

  let onDone: (result: NodeConfiguration) => unknown = () => {};

  let isUnsetAllowed = true;

  $: {
    if (!isUnsetAllowed) {
      currentValues = {
        colorLabel: currentValues.colorLabel || "transparent",
        theme: currentValues.theme || DEFAULT_THEME,
        weightInterpretation:
          currentValues.weightInterpretation || getWeightInterpretations()[0],
      };
    }
  }

  let dialog: HTMLDialogElement;

  setContext<ConfigurationDialogContext>("configuration-dialog", {
    open: (config, allowUnset, callback) => {
      currentValues = config;
      isUnsetAllowed = allowUnset;
      onDone = callback;

      if (
        !isUnsetAllowed &&
        (!currentValues.colorLabel ||
          !currentValues.theme ||
          !currentValues.weightInterpretation)
      ) {
        throw "Error: all fields must be set if unset is not allowed";
      }

      dialog.showModal();
    },
  });
</script>

<dialog bind:this={dialog}>
  <form method="dialog">
    <div class="content">
      <label for="weight-interpretation"
        >Weight interpretation:
        <span class="grow" />
        <select
          name="weight-interpretation"
          bind:value={currentValues.weightInterpretation}
        >
          {#if isUnsetAllowed}
            <option value={undefined}>Inherit</option>
          {/if}
          {#each getWeightInterpretations() as weightInterpretation}
            <option value={weightInterpretation}>
              {weightInterpretation.name}
            </option>
          {/each}
        </select>
      </label>
      <div class="spacer" />
      <label for="theme"
        >Theme
        <span class="grow" />
        {#await getThemes()}
          <p>...</p>
        {:then themes}
          <select name="theme" bind:value={currentValues.theme}>
            {#if isUnsetAllowed}
              <option value={undefined}>Inherit</option>
            {/if}
            {#each themes as theme}
              <option value={theme}>{theme.name}</option>
            {/each}
          </select>
        {/await}
      </label>
      <div class="spacer" />
      <label for="label-color">
        Label:
        <span class="grow" />
        <select
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
      <RaisedButton
        type="button"
        on:click={() => {
          onDone(currentValues);
          dialog.close();
        }}
      >
        Submit
      </RaisedButton>
      <RaisedButton type="button" on:click={() => dialog.close()}
        >Cancel</RaisedButton
      >
    </div>
  </form>
</dialog>

<slot />

<style>
  div.spacer {
    height: 1rem;
  }

  label {
    display: flex;
  }

  label .grow {
    flex: 1;
    min-width: 2rem;
  }

  select {
    width: 5rem;
  }

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
</style>

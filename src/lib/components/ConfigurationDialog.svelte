<script lang="ts">
  import { setContext } from "svelte";
  import { WEIGHT_INTERPRETATIONS } from "../ProgressNode/constants";
  import type { NodeConfiguration } from "../ProgressNode/types";
  import type { ConfigurationDialogContext } from "../types";

  let currentValues: Required<NodeConfiguration> = {
    weightInterpretation: "none",
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
    <div>
      <label for="weight-interpretation">Weight interpretation: </label>
      <select
        name="weight-interpretation"
        bind:value={currentValues.weightInterpretation}
      >
        {#each WEIGHT_INTERPRETATIONS as weightInterpretation}
          <option value={weightInterpretation}>{weightInterpretation}</option>
        {/each}
      </select>
    </div>

    <div class="buttons">
      <button
        type="button"
        on:click={() => {
          onDone(currentValues);
          dialog.close();
        }}>Submit</button
      >
      <button type="button" on:click={() => dialog.close()}>Cancel</button>
    </div>
  </form>
</dialog>

<slot />

<style>
  dialog {
    border: none;
    border-radius: 0.5rem;
  }

  .buttons {
    display: flex;
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

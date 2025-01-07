<script lang="ts">
  import EditIcon from "../EditIcon.svelte";
  import SaveIcon from "../SaveIcon.svelte";

  export let isEditing: boolean;
  export let onEditStart: () => unknown;
  export let onEditEnd: (v: string) => unknown;
  export let value: string;

  let currentValue = "";
  $: isEditing, (currentValue = value);

  let inputElement: HTMLInputElement;

  let hover = false;

  $: isEditing, (hover = false);
  $: if (isEditing) inputElement?.focus();
</script>

{#if isEditing}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click|stopPropagation>
    <input
      bind:this={inputElement}
      bind:value={currentValue}
      on:submit={() => onEditEnd(currentValue)}
      on:keyup={(e) => {
        if (e.key === "Escape") onEditEnd(value); // cancel edit
        if (e.key === "Enter") onEditEnd(currentValue);
      }}
    />
    <button on:click|stopPropagation={() => onEditEnd(currentValue)}>
      <SaveIcon size={20} />
    </button>
  </div>
{:else}
  <div
    on:mouseenter={() => (hover = true)}
    on:mouseleave={() => (hover = false)}
  >
    <span>{value}</span>

    <button
      class:hover
      class="edit"
      on:click|stopPropagation={() => onEditStart()}
    >
      <EditIcon size={20} />
    </button>
  </div>
{/if}

<style>
  div {
    display: flex;
    flex: 1;
  }

  button {
    border: none;
    background: transparent;
    color: var(--text-color-b);
  }

  button.edit {
    padding: 0px;
    opacity: 0%;

    transition-property: color, opacity;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.86, 0, 0.07, 1);
  }

  button.edit.hover {
    opacity: 100%;
  }

  button.edit:hover {
    color: var(--accent);
  }

  span,
  input {
    margin: 0.5rem;
    padding: 0.25rem;
  }

  input {
    border-radius: 8rem;
  }
</style>

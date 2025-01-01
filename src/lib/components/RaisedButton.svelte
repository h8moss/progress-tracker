<script lang="ts">
  export let type: "submit" | "reset" | "button" = "button";
  export let className: string = "";
</script>

<button {type} class={className} on:click><slot /></button>

<style>
  button {
    border: 1px solid transparent;
    color: white;
    background-color: #2f99fc;
    font-weight: bold;
    padding: 0.5rem;
    border-radius: 10px;

    /* Number 2 of https://getcssscan.com/css-box-shadow-examples*/
    box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  }

  button:hover {
    background-color: #2a87ff;
  }
</style>

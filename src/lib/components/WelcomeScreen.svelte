<script lang="ts">
  import { emit } from "@tauri-apps/api/event";
  import RecentlyUsed from "./RecentlyUsed.svelte";

  const onNew = () => {
    emit("new", "");
  };

  const onOpen = async () => {
    emit("open");
  };

  const onNewFromFolder = async () => {
    emit("new-folder", "");
  };
</script>

<div class="content col">
  <h1>Welcome</h1>
  <div class="row">
    <div class="col start-buttons">
      <h2>Start</h2>
      <button on:click={onOpen}>Open...</button>
      <button on:click={onNew}>New...</button>
      <div class="new-from-folder-button">
        <button on:click={onNewFromFolder}>New from folder...</button>
        <div
          class="question"
          data-popup="Create a progress tracker designed for video-series, will make a task out of every folder and video file it finds, making the weight the file's duration"
        >
          ?
        </div>
      </div>
    </div>
    <div class="col">
      <h2>Recent</h2>
      <RecentlyUsed />
    </div>
  </div>
</div>

<style>
  h2 {
    text-align: center;
  }

  .row,
  .col {
    display: flex;
  }

  .row {
    width: 100%;
    flex: 1;
  }

  .row > div {
    flex: 1;
  }

  .col {
    flex-direction: column;
  }

  .content {
    height: 100%;
  }

  .start-buttons {
    justify-content: space-around;
  }

  .start-buttons button {
    background-color: transparent;
    border: none;
    font-size: large;
    color: var(--accent);
  }

  .start-buttons button:hover {
    text-decoration: underline;
  }

  .new-from-folder-button {
    display: flex;
    margin: 0px auto;

    justify-content: center;
    width: min-content;

    white-space: nowrap;
  }

  .new-from-folder-button button {
    flex: 1;
  }

  .question {
    color: rgba(0, 0, 0, 0.3);
    border-radius: 20px;
    border: 3px solid rgba(0, 0, 0, 0.3);
    width: 1rem;
    height: 1rem;

    font-size: 1rem;
    font-weight: bold;

    margin: 0px;
    padding: 0px;
    text-align: center;

    cursor: pointer;

    position: relative;
  }

  .question::after {
    content: attr(data-popup);

    position: absolute;
    top: -1.5rem;
    left: 1.5rem;

    background-color: #1e2338;
    color: white;

    font-weight: normal;

    border-radius: 4px;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

    display: flex;

    width: 0rem;
    height: 5rem;

    text-align: justify;

    padding: 0.25rem 0px;

    transition: 200ms cubic-bezier(0.165, 0.84, 0.44, 1);
    transition-property: padding, width;

    white-space: normal;
    overflow: hidden;
  }

  .question:hover::after {
    width: 20rem;
    padding: 0.25rem;
  }
</style>

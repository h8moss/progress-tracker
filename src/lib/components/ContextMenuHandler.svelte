<script lang="ts">
  import { appWindow } from "@tauri-apps/api/window";
  import { onMount, setContext, onDestroy } from "svelte";
  import type {
    ContextMenuHandle,
    ContextMenuItem,
    ContextMenuItemHandler,
  } from "../types";
  import { globalShortcut } from "@tauri-apps/api";
  import { ContextMenuItems } from "../util";

  const MENU_WIDTH = 200;
  const MENU_ITEM_HEIGHT = 35;

  let x = 0;
  let y = 0;

  let showMenu = false;
  let menuItems: ContextMenuItem[] = [];
  let itemHandler: ContextMenuItemHandler | null = null;

  let mouse = {
    x: 0,
    y: 0,
  };

  const mouseMoveHandler = (e: MouseEvent) => {
    mouse = { x: e.x, y: e.y };
  };

  onMount(() => document.addEventListener("mousemove", mouseMoveHandler));

  onDestroy(() => document.removeEventListener("mousemove", mouseMoveHandler));

  setContext<ContextMenuHandle>("context-menu", {
    showContextMenu: async (itemsObj = ContextMenuItems.new(), handler) => {
      const items = itemsObj.items;
      const menuHeight = Math.max(MENU_ITEM_HEIGHT * items.length, 100);

      const windowSize = await appWindow.innerSize();
      const offset = {
        x: windowSize.width - mouse.x < MENU_WIDTH ? -MENU_WIDTH : 0,
        y: windowSize.height - mouse.y < menuHeight ? -menuHeight : 0,
      };

      x = mouse.x + offset.x;
      y = mouse.y + offset.y;

      showMenu = true;
      menuItems = items;
      itemHandler = handler;
    },
  });

  $: globalShortcut.isRegistered("esc").then((isRegistered) => {
    if (showMenu && !isRegistered) {
      globalShortcut.register("esc", () => (showMenu = false));
    } else if (!showMenu && isRegistered) {
      globalShortcut.unregister("esc");
    }
  });
</script>

<svelte:body on:contextmenu|preventDefault />

<slot />
{#if showMenu}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="backdrop"
    on:click={() => {
      showMenu = false;
    }}
    on:contextmenu|preventDefault={() => {
      showMenu = false;
      itemHandler = null;
    }}
  >
    <div
      class="context-menu"
      style:width={`${MENU_WIDTH}px`}
      style:left={`${x}px`}
      style:top={`${y}px`}
    >
      {#each menuItems as item}
        <button
          style:height={`${MENU_ITEM_HEIGHT}px`}
          style:color={item.color}
          on:click={() => {
            if (itemHandler) itemHandler(item);
            showMenu = false;
            itemHandler = null;
          }}>{item.label}</button
        >
      {/each}
    </div>
  </div>
{/if}

<style>
  .context-menu {
    overflow-y: auto;
    overflow-x: hidden;

    min-height: 100px;

    background-color: white;

    position: absolute;

    display: flex;
    flex-direction: column;

    /* #18 from (here)[https://getcssscan.com/css-box-shadow-examples] */
    box-shadow:
      rgba(50, 50, 93, 0.25) 0px 2px 5px -1px,
      rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;

    border-radius: 10px;
  }

  .context-menu button {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #202020;
  }
  .context-menu button:hover {
    background-color: #ddd;
  }

  .backdrop {
    position: absolute;

    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;

    background-color: transparent;

    border: none;

    cursor: default;

    z-index: 500;
  }
</style>

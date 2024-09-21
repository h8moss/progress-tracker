<script lang="ts">
  import {
    createEventDispatcher,
    getContext,
    onDestroy,
    onMount,
  } from "svelte";
  import ProgressIndicator from "../ProgressIndicator.svelte";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import type { ProgressNode } from "../../ProgressNode";
  import {
    copyWith,
    getIsDone,
    getTotalWeight,
    getWeightedProgress,
    isNodeValid,
    makeNodeValid,
    newChildTitle,
    plusChildren,
    setIsDone,
    getChildrenLabels,
    getUndoneLabels,
  } from "../../ProgressNode/util";
  import type { NodeConfiguration } from "../../ProgressNode/types";
  import type {
    ConfigurationDialogContext,
    ContextMenuHandle,
  } from "../../types";
  import { slide, scale } from "svelte/transition";
  import ArrowRight from "./ArrowRight.svelte";
  import { ContextMenuItems, interpretWeight } from "../../util";
  import weightStore from "./weightStore";
  import titleEditStore from "./titleEditStore";
  import naturalCompare from "natural-compare-lite";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import CustomCheckbox from "../CustomCheckbox.svelte";
  import { tweened } from "svelte/motion";
  import ThemeProvider from "./ThemeProvider.svelte";

  export let headless: boolean = false;
  export let node: ProgressNode;
  export let defaultConfig: Required<NodeConfiguration>;
  export let canDelete = true;

  export let isLast: () => boolean;
  export let isFirst: () => boolean;

  let oldProgressValue = 0;

  type MoveDirections = "UP" | "DOWN" | "TOP" | "BOTTOM";

  const dispatch = createEventDispatcher<{
    changed: ProgressNode | null;
    move: MoveDirections;
  }>();

  let showChildren = false;

  let unsubFoldAll: UnlistenFn | null;
  let unsubUnfoldAll: UnlistenFn | null;

  onMount(async () => {
    unsubFoldAll = await listen("fold-all", (_) => (showChildren = false));
    unsubUnfoldAll = await listen("unfold-all", (_) => (showChildren = true));
  });

  onDestroy(() => {
    if (unsubFoldAll) unsubFoldAll();
    if (unsubUnfoldAll) unsubUnfoldAll();
  });

  const title = titleEditStore(node.title, (title) =>
    dispatch("changed", copyWith(node, { title })),
  );
  $: editableTitle = title.editableTitle;

  const contextMenuContext = getContext<ContextMenuHandle>("context-menu");
  const configurationDialogCtx = getContext<ConfigurationDialogContext>(
    "configuration-dialog",
  );

  $: if (!isNodeValid(node)) dispatch("changed", makeNodeValid(node));

  $: configuration = {
    ...structuredClone(defaultConfig),
    ...structuredClone(node ? node.configuration : {}),
  } as Required<NodeConfiguration>;

  const progress = tweened(getWeightedProgress(node), {
    duration: 200,
    easing: cubicOut,
  });

  $: progressInterpreted = interpretWeight({
    weight: $progress,
    weightInterpretation: configuration?.weightInterpretation || "none",
  });

  $: progress.set(getWeightedProgress(node));
  $: weight = weightStore(
    node.weight || 0,
    configuration.weightInterpretation,
    (weight) => dispatch("changed", copyWith(node, { weight })),
  );
  $: editableWeight = weight.editableWeight;

  const onClick = () => {
    if (node.children) showChildren = !showChildren;
    if (node.isDone !== undefined) {
      dispatch("changed", copyWith(node, { isDone: !node.isDone }));
    }
  };

  const onChildChanged = (
    index: number,
    newChild: CustomEvent<ProgressNode | null>,
  ) => {
    if (node.children) {
      const child = newChild.detail;
      const copy = structuredClone(node);
      if (child === null) {
        copy.children?.splice(index, 1);
      } else {
        copy.children![index] = child;
      }
      dispatch("changed", copy);
    }
  };

  const onChildMoved = (index: number, event: CustomEvent<MoveDirections>) => {
    const direction = event.detail;
    const copy = structuredClone(node);

    if (!copy.children) return;

    switch (direction) {
      case "UP":
        {
          if (index === 0) return;
          const temp = copy.children[index - 1];
          copy.children[index - 1] = copy.children[index];
          copy.children[index] = temp;
        }
        break;
      case "DOWN":
        {
          const temp = copy.children[index + 1];
          copy.children[index + 1] = copy.children[index];
          copy.children[index] = temp;
        }
        break;
      case "TOP":
        {
          const temp = copy.children[index];
          for (let i = index; i > 0; i--) {
            copy.children[i] = copy.children[i - 1];
          }
          copy.children[0] = temp;
        }
        break;
      case "BOTTOM":
        {
          const end = copy.children.length - 1;
          const temp = copy.children[index];
          for (let i = index; i < end; i++) {
            copy.children[i] = copy.children[i + 1];
          }
          copy.children[end] = temp;
        }
        break;
    }

    dispatch("changed", copy);
  };

  const contextMenuCallbacks: Record<string, () => void> = {
    rename: () => title.onEditStarted(),
    "toggle-children": () => {
      if (node.children) {
        dispatch(
          "changed",
          copyWith(node, {
            children: undefined,
            isDone: false,
            weight: 1,
          }),
        );
      } else {
        dispatch(
          "changed",
          copyWith(node, {
            children: [],
            isDone: undefined,
            weight: undefined,
          }),
        );
      }
    },
    "add-child": () =>
      dispatch(
        "changed",
        plusChildren(node, [
          makeNodeValid({
            title: newChildTitle(node),
            isDone: false,
            weight: 1,
            configuration: {},
          }),
        ]),
      ),
    sort: () => {
      const copy = structuredClone(node);
      if (copy.children) {
        copy.children = copy.children.sort((a, b) =>
          naturalCompare(a.title, b.title),
        );

        dispatch("changed", copy);
      }
    },
    delete: () => dispatch("changed", null),
    "toggle-all": () => dispatch("changed", setIsDone(node, !getIsDone(node))),
    "edit-weight": () => weight.onStartEditing(),
    configuration: () => {
      console.log({ configuring: true, node });
      configurationDialogCtx.open(node.configuration, true, (value) =>
        dispatch(
          "changed",
          copyWith(node, {
            configuration: value,
          }),
        ),
      );
    },
    "shift-up": () => dispatch("move", "UP"),
    "shift-top": () => dispatch("move", "TOP"),
    "shift-down": () => dispatch("move", "DOWN"),
    "shift-bottom": () => dispatch("move", "BOTTOM"),
  };

  const onContextMenu = () => {
    const contextMenuItems = ContextMenuItems.new()
      // Add if it has a head (is not the main view)
      .addAllIf(
        [
          { id: "rename", label: "Rename" },
          { id: "configuration", label: "Configuration" },
        ],
        !headless,
      )
      // Add if childless
      .addAllIf(
        [
          { id: "toggle-children", label: "Make childful" },
          { id: "edit-weight", label: "Edit weight" },
        ],
        !node.children,
      )
      // add if childful
      .addAllIf(
        [
          { id: "toggle-children", label: "Make childless" },
          { id: "toggle-all", label: "Toggle all" },
          { id: "add-child", label: "New child" },
          { id: "sort", label: "Sort" },
        ],
        !!node.children,
      )
      .addAllIf(
        [
          { id: "shift-top", label: "Move to top" },
          { id: "shift-up", label: "Move up" },
        ],
        !headless && !isFirst(),
      )
      .addAllIf(
        [
          { id: "shift-down", label: "Move down" },
          { id: "shift-bottom", label: "Move to bottom" },
        ],
        !headless && !isLast(),
      )
      // add if can delete
      .addIf({ id: "delete", label: "Delete", color: "red" }, canDelete);

    contextMenuContext.showContextMenu(contextMenuItems, (item) => {
      contextMenuCallbacks[item.id]();
    });
  };
</script>

{#if node}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <ThemeProvider
    backgroundColor={defaultConfig.theme.backgroundColor !==
    configuration.theme.backgroundColor
      ? configuration.theme.backgroundColor
      : "transparent"}
    theme={configuration.theme}
    colorLabel={node.configuration?.colorLabel || "transparent"}
  >
    {(console.log({ config: node.configuration, name: node.title }), "")}
    <div
      class="content"
      on:click|stopPropagation={onClick}
      on:contextmenu|preventDefault|stopPropagation={onContextMenu}
    >
      <div class="head" class:headless>
        <div class="title">
          {#if node.isDone !== undefined}
            <CustomCheckbox
              checked={node.isDone}
              stopColorA={configuration.theme.highlightColorA}
              stopColorB={configuration.theme.highlightColorB}
            />
          {:else}
            <ArrowRight isRotated={showChildren} />
          {/if}
          <div class="title-text">
            <div class="label" />
            {#if $title.canEdit}
              <div class="editing-input" on:click|stopPropagation>
                <input
                  bind:value={$editableTitle}
                  on:submit={() => title.onEditDone()}
                />
                <button on:click={() => title.onEditDone()}>Ok</button>
              </div>
            {:else}
              <p>{node.title}</p>
            {/if}
            <div class="child-labels">
              {#each getChildrenLabels(node, getUndoneLabels) as labelColor (labelColor)}
                <div
                  class="short-label"
                  style:background-color={labelColor}
                  transition:scale
                />
              {/each}
            </div>
          </div>
        </div>
        <ProgressIndicator
          progress={$progress}
          maximum={getTotalWeight(node)}
        />
      </div>
      <div class="weights">
        <p>{progressInterpreted}</p>

        {#if $weight.isEditing}
          <div class="weight-editor">
            <div on:click|stopPropagation>
              <input bind:value={$editableWeight} type="number" />
              <p>{$weight.editableInterpreted}</p>
            </div>
            <button on:click={weight.onFinishEditing}>Ok</button>
          </div>
        {:else}
          <p>
            {interpretWeight({
              weight: getTotalWeight(node),
              weightInterpretation: configuration.weightInterpretation,
            })}
          </p>
        {/if}
      </div>
      {#if node.children && (showChildren || headless)}
        <div
          class="children"
          transition:slide={{
            duration: 200,
            easing: cubicInOut,
          }}
        >
          {#if node.children.length === 0}
            <p>No sub-tasks yet...</p>
          {/if}
          {#each node.children as child, index (child.id)}
            <svelte:self
              isLast={() => index === (node.children?.length ?? 0) - 1}
              isFirst={() => index === 0}
              node={child}
              on:changed={(newChild) => onChildChanged(index, newChild)}
              on:move={(e) => onChildMoved(index, e)}
              defaultConfig={configuration}
            />
          {/each}
        </div>
      {/if}
    </div>
  </ThemeProvider>
{/if}

<style>
  .content {
    --background-color-opacity: 0;

    display: flex;
    flex-direction: column;

    background-color: rgba(
      var(--darken-color),
      var(--background-color-opacity)
    );
    padding: 0.5rem;
    margin: 0.25rem;
    border-radius: 0.25rem;

    transition: background 200ms cubic-bezier(0.19, 1, 0.22, 1);

    color: var(--text-color);

    border-left: 1px solid var(--label-color, transparent);
  }

  div.child-labels {
    display: flex;
  }

  .label {
    width: 50px;
    height: 10px;
    border-radius: 2rem;
    background-color: var(--label-color, transparent);
  }

  .short-label {
    width: 10px;
    height: 10px;
    border-radius: 2rem;
    margin-right: 0.25rem;
  }

  .content:hover {
    --background-color-opacity: 0.05;
  }

  .head {
    display: flex;
    justify-content: space-between;
  }

  .head.headless {
    display: none;
  }

  .title {
    display: flex;
  }

  .weights {
    display: flex;
    justify-content: space-between;

    font-size: 0.75rem;
    border-bottom: var(--text-color, black) 1px solid;
  }

  .weights > p {
    margin: 0px;
  }

  .children {
    margin-left: 2rem;
  }

  .editing-input {
    display: flex;
    flex: 1;
  }

  .editing-input > input {
    flex: 1;
  }

  .weight-editor {
    display: flex;
  }
</style>

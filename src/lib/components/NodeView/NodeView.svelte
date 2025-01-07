<script lang="ts">
  import {
    createEventDispatcher,
    getContext,
    onDestroy,
    onMount,
  } from "svelte";
  import type { WeightDialogContext } from "../../types";
  import ProgressIndicator from "../ProgressIndicator.svelte";
  import { cubicOut } from "svelte/easing";
  import type { ProgressNode } from "../../ProgressNode";
  import { NodeType } from "../../ProgressNode/types";
  import LogoSvg from "../LogoSVG.svelte";
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
  import { slide } from "svelte/transition";
  import ArrowRight from "./ArrowRight.svelte";
  import { ContextMenuItems, interpretWeight } from "../../util";
  import titleEditStore from "./titleEditStore";
  import naturalCompare from "natural-compare-lite";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import CustomCheckbox from "../CustomCheckbox.svelte";
  import { tweened } from "svelte/motion";
  import ThemeProvider from "./ThemeProvider.svelte";
  import EditableTextfield from "./EditableTextfield.svelte";

  export let headless: boolean = false;
  export let node: ProgressNode;
  export let defaultConfig: Required<NodeConfiguration>;
  export let canDelete = true;

  export let isLast: () => boolean;
  export let isFirst: () => boolean;

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

  const weightDialogCtx = getContext<WeightDialogContext>("weight-dialog");
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

  $: progressInterpreted = interpretWeight(
    configuration.weightInterpretation,
    $progress,
  );

  $: progress.set(getWeightedProgress(node));

  const onClick = () => {
    if (node.type === NodeType.childful) showChildren = !showChildren;
    if (node.type === NodeType.checkbox) {
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
    "make-childful": () => {
      if (node.type !== NodeType.childful) {
        dispatch(
          "changed",
          copyWith(node, {
            children: [],
            isDone: undefined,
            weight: undefined,
            progress: undefined,
            type: NodeType.childful,
          }),
        );
      }
    },
    "make-checkbox": () => {
      if (node.type !== NodeType.checkbox) {
        dispatch(
          "changed",
          copyWith(node, {
            children: undefined,
            isDone: false,
            weight: node.weight ?? 1.0,
            progress: undefined,
            type: NodeType.checkbox,
          }),
        );
      }
    },
    "make-slider": () => {
      if (node.type !== NodeType.slider) {
        dispatch(
          "changed",
          copyWith(node, {
            children: undefined,
            isDone: undefined,
            weight: node.weight ?? 1.0,
            progress: 0.0,
            type: NodeType.slider,
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
            type: NodeType.checkbox,
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
    "edit-weight": () =>
      weightDialogCtx.open(
        {
          value: node.weight || 0,
          interpretation: configuration.weightInterpretation,
        },
        defaultConfig.weightInterpretation,
        (result) => {
          dispatch(
            "changed",
            copyWith(node, {
              configuration: {
                ...node.configuration,
                weightInterpretation: result.interpretation,
              },
              weight: result.value,
            }),
          );
        },
      ),
    configuration: () => {
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
          { id: "edit-weight", label: "Edit weight" },
          { id: "make-childful", label: "Make childful" },
        ],
        node.type !== NodeType.childful,
      )
      // Add if not checkbox
      .addAllIf(
        [{ id: "make-checkbox", label: "Make checkbox" }],
        node.type !== NodeType.checkbox,
      )
      // Add if not slider
      .addAllIf(
        [{ id: "make-slider", label: "Make slider" }],
        node.type !== NodeType.slider,
      )
      // add if childful
      .addAllIf(
        [
          { id: "toggle-all", label: "Toggle all" },
          { id: "add-child", label: "New child" },
          { id: "sort", label: "Sort" },
        ],
        node.type === NodeType.childful,
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
      transition:slide
    >
      <div class="head" class:headless>
        <div class="title">
          {#if node.type === NodeType.checkbox}
            <CustomCheckbox
              checked={node.isDone || false}
              stopColorA={configuration.theme.highlightColorA}
              stopColorB={configuration.theme.highlightColorB}
            />
          {:else if node.type === NodeType.childful}
            <ArrowRight isRotated={showChildren} />
          {:else}
            <div class="logo">
              <LogoSvg
                offset={$progress * 100}
                progress={$progress * 100}
                stopColorA={configuration.theme.highlightColorA}
                stopColorB={configuration.theme.highlightColorB}
              />
            </div>
          {/if}
          <div class="title-text">
            <div class="label" />
            <EditableTextfield
              isEditing={$title.canEdit}
              onEditStart={() => title.onEditStarted()}
              onEditEnd={(v) => {
                title.editableTitle.set(v);
                title.onEditDone();
              }}
              value={node.title}
            />
            {#if node.type === NodeType.slider}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={node.progress}
                style:accent-color={configuration.theme.highlightColorA}
                on:input={(e) => {
                  console.log("Change!! ");
                  console.log(e.target.value);
                  dispatch(
                    "changed",
                    copyWith(node, {
                      progress: Number.parseFloat(e.target.value),
                    }),
                  );
                }}
              />
            {/if}
            <div class="label-padding" />

            <div class="child-labels">
              {#each getChildrenLabels(node, getUndoneLabels) as labelColor (labelColor)}
                <div class="short-label" style:background-color={labelColor} />
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
        <p>
          {interpretWeight(
            configuration.weightInterpretation,
            getTotalWeight(node),
          )}
        </p>
      </div>
      {#if node.children && (showChildren || headless)}
        <div class="children">
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
          <button
            class="add-child"
            on:click|stopPropagation={() =>
              dispatch(
                "changed",
                plusChildren(node, [
                  makeNodeValid({
                    title: newChildTitle(node),
                    type: NodeType.checkbox,
                    isDone: false,
                    weight: 1,
                    configuration: {},
                  }),
                ]),
              )}
            transition:slide
          >
            <div />
            <span>+</span>
          </button>
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
  .label-padding {
    width: 50px;
    height: 10px;
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
    flex: 1;
  }

  .title-text {
    flex: 1;
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

  button.add-child {
    background-color: transparent;
    border: none;

    margin: auto;
    padding: 0px;

    width: 3rem;
    height: 3rem;
    padding: 0.5rem;

    display: grid;
    grid-template-rows: 1fr;

    font-size: 1.5rem;
  }

  button.add-child > div {
    width: 100%;
    height: 100%;
    background-color: var(--accent-b);
    z-index: 1;

    transform: scale(0);

    transition-property: transform, border-radius;
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
  }

  button.add-child:hover > div {
    transform: scale(1) translate(0px);
    border-radius: 1rem;
  }

  button.add-child > span {
    z-index: 2;
    margin: auto;
  }

  button.add-child > * {
    grid-column: 1;
    grid-row: 1;
  }

  div.logo {
    padding: 0.25rem;
    width: 20px;
    display: flex;
    justify-content: center;
    cursor: pointer;
  }

  input[type="range"] {
    width: 80%;
  }
</style>

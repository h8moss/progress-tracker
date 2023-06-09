<script lang="ts">
  import { createEventDispatcher, getContext } from "svelte";
  import { derived, type Readable } from "svelte/store";
  import ProgressIndicator from "./ProgressIndicator.svelte";
  import { tweened } from "svelte/motion";
  import { cubicInOut, cubicOut } from "svelte/easing";
  import type { ProgressNode } from "../ProgressNode";
  import {
    copyWith,
    getIsDone,
    getTotalWeight,
    getWeightedProgress,
    isNodeValid,
    makeNodeValid,
    plusChildren,
    setIsDone,
  } from "../ProgressNode/util";
  import type { NodeConfiguration } from "../ProgressNode/types";
  import { interpretWeight } from "../util";
  import type { ConfigurationDialogContext, ContextMenuHandle } from "../types";
  import { slide } from "svelte/transition";
  import ArrowRight from "./ArrowRight.svelte";

  export let headless: boolean = false;
  export let node: Readable<ProgressNode>;
  export let defaultConfig: Required<NodeConfiguration>;
  export let canDelete = true;
  export let path: string;

  const dispatch = createEventDispatcher<{ changed: ProgressNode | null }>();

  let showChildren = true;

  let isEditingTitle = false;
  let titleEdited = "";

  let isEditingWeight = false;
  let weightEdited = 0;

  const generateChildTitle = (children: ProgressNode[]): string => {
    let count = 0;
    let title = "Untitled";
    const titles = children.map((v) => v.title);
    while (titles.includes(title)) {
      count++;
      title = `Untitled - ${count}`;
    }

    return title;
  };

  const onClick = () => {
    if ($node.children) showChildren = !showChildren;
    if ($node.isDone !== undefined) {
      dispatch("changed", copyWith($node, { isDone: !$node.isDone }));
    }
  };

  const onChildChanged = (
    index: number,
    newChild: CustomEvent<ProgressNode | null>
  ) => {
    if ($node.children) {
      const child = newChild.detail;
      const copy = structuredClone($node);
      if (child === null) {
        copy.children?.splice(index, 1);
      } else {
        copy.children![index] = child;
      }
      dispatch("changed", copy);
    }
  };

  const arrowRotation = tweened(0, {
    duration: 200,
    easing: cubicInOut,
  });

  $: if (!isNodeValid($node)) dispatch("changed", makeNodeValid($node));

  $: weightedProgress = getWeightedProgress($node);
  const tweenWeightedProgress = tweened(weightedProgress, {
    duration: 200,
    easing: cubicOut,
  });

  $: tweenWeightedProgress.set(weightedProgress);

  $: configuration = {
    ...structuredClone(defaultConfig),
    ...structuredClone($node ? $node.configuration : {}),
  } as Required<NodeConfiguration>;

  $: interpretedProgress = interpretWeight({
    weight: $tweenWeightedProgress,
    weightInterpretation: configuration.weightInterpretation,
  });

  $: interpretedWeight = interpretWeight({
    weight: getTotalWeight($node),
    weightInterpretation: configuration.weightInterpretation,
  });

  $: interpretedEditedWeight = interpretWeight({
    weight: weightEdited ?? 0,
    weightInterpretation: configuration.weightInterpretation,
  });

  $: $arrowRotation = showChildren ? 90 : 0;

  const contextMenuContext = getContext<ContextMenuHandle>("context-menu");
  const configurationDialogCtx = getContext<ConfigurationDialogContext>(
    "configuration-dialog"
  );

  const onContextMenu = () => {
    const childrenSpecificOptions = $node.children
      ? [
          { id: "toggle-all", label: "Toggle all" },
          { id: "add-child", label: "New child" },
        ]
      : [
          {
            id: "edit-weight",
            label: "Edit weight",
          },
        ];
    contextMenuContext.showContextMenu(
      [
        ...(headless
          ? []
          : [
              {
                id: "rename",
                label: "Rename",
              },
              {
                id: "toggle-children",
                label: $node.children ? "Make childless" : "Make childful",
              },
              {
                id: "configuration",
                label: "Configuration",
              },
            ]),

        ...childrenSpecificOptions,
        ...(canDelete
          ? [
              {
                id: "delete",
                label: "Delete",
                color: "red",
              },
            ]
          : []),
      ],
      (v) => {
        switch (v.id) {
          case "rename":
            isEditingTitle = true;
            titleEdited = $node.title;
            break;
          case "toggle-children":
            if ($node.children) {
              dispatch(
                "changed",
                copyWith($node, {
                  children: undefined,
                  isDone: false,
                  weight: 1,
                })
              );
            } else {
              dispatch(
                "changed",
                copyWith($node, {
                  children: [],
                  isDone: undefined,
                  weight: undefined,
                })
              );
            }
            break;
          case "add-child":
            dispatch(
              "changed",
              plusChildren($node, [
                makeNodeValid({
                  title: generateChildTitle($node.children!),
                  isDone: false,
                  weight: 1,
                }),
              ])
            );
            showChildren = true;
            break;
          case "delete":
            dispatch("changed", null);
            break;
          case "toggle-all":
            const newResult = !getIsDone($node);
            dispatch("changed", setIsDone($node, newResult));
            break;
          case "edit-weight":
            isEditingWeight = true;
            weightEdited = $node.weight!;
            break;

          case "configuration":
            configurationDialogCtx.open(
              {
                ...defaultConfig,
                ...$node.configuration,
              },
              (value) =>
                dispatch(
                  "changed",
                  copyWith($node, {
                    configuration: value,
                  })
                )
            );
            break;
        }
      }
    );
  };
</script>

{#if $node}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="content"
    on:click|stopPropagation={onClick}
    on:contextmenu|preventDefault|stopPropagation={onContextMenu}
  >
    <div class="head" class:headless>
      <div class="title">
        {#if $node.isDone !== undefined}
          <input type="checkbox" bind:checked={$node.isDone} />
        {:else}
          <ArrowRight rotation={$arrowRotation} />
        {/if}
        {#if isEditingTitle}
          <div class="editing-input" on:click|stopPropagation>
            <input bind:value={titleEdited} />
            <button
              on:click={() => {
                dispatch(
                  "changed",
                  copyWith($node, {
                    title: titleEdited,
                  })
                );
                isEditingTitle = false;
              }}>Ok</button
            >
          </div>
        {:else}
          <p>{$node.title}</p>
        {/if}
      </div>
      <ProgressIndicator
        progress={$tweenWeightedProgress}
        maximum={getTotalWeight($node)}
      />
    </div>
    <div class="weights">
      <p>{interpretedProgress}</p>

      {#if isEditingWeight}
        <div class="weight-editor">
          <div>
            <input bind:value={weightEdited} type="number" />
            <p>{interpretedEditedWeight}</p>
          </div>
          <button
            on:click={() => {
              dispatch(
                "changed",
                copyWith($node, {
                  weight: weightEdited,
                })
              );
              isEditingWeight = false;
            }}>Ok</button
          >
        </div>
      {:else}
        <p>
          {interpretedWeight}
        </p>
      {/if}
    </div>
    {#if $node.children && (showChildren || headless)}
      <div
        class="children"
        transition:slide={{
          duration: 200,
          easing: cubicInOut,
        }}
      >
        {#if $node.children.length === 0}
          <p>No sub-tasks yet...</p>
        {/if}
        {#each $node.children as child, index (child.id)}
          <svelte:self
            node={derived(node, (node) => {
              return node && node.children && node.children[index];
            })}
            on:changed={(newChild) => onChildChanged(index, newChild)}
            defaultConfig={configuration}
            path={`${path}//${child.title}`}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .content {
    --background-color-opacity: 0;

    display: flex;
    flex-direction: column;

    background-color: rgba(0, 0, 0, var(--background-color-opacity));
    padding: 0.5rem;
    margin: 0.25rem;
    border-radius: 0.25rem;

    transition: background 200ms cubic-bezier(0.19, 1, 0.22, 1);
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
    border-bottom: rgba(0, 0, 0, 0.7) 1px solid;
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

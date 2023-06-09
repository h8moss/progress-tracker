import type { Readable } from "svelte/store";
import type { ProgressNode } from "./ProgressNode";
import type { WEIGHT_INTERPRETATIONS } from "./ProgressNode/constants";
import type { NodeConfiguration } from "./ProgressNode/types";

/**
 Defines an object that can be represented in a .json file
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JSONValue[]
  | { [key: string]: JSONValue };

export type NodeManager = {
  progressNode: Readable<ProgressNode | null>;
  path: Readable<string | null>;
  needsSave: Readable<boolean>;
};

export type ConfigurationDialogContext = {
  open: (
    config: Required<NodeConfiguration>,
    callback: (result: Required<NodeConfiguration>) => unknown
  ) => void;
};

export type WeightInterpretation = (typeof WEIGHT_INTERPRETATIONS)[number];

export type ContextMenuItem = {
  label: string;
  id: string;

  color?: string;
};

export type ContextMenuItemHandler = (
  item: ContextMenuItem
) => void | Promise<void>;

export type ContextMenuHandle = {
  showContextMenu: (
    items: ContextMenuItem[],
    handler: ContextMenuItemHandler
  ) => Promise<void>;
};

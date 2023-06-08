import type { Readable } from "svelte/store";
import type { ProgressNode } from "./ProgressNode";

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

export type WeightInterpretation =
  | "none"
  | "seconds"
  | "centimeters"
  | "grams"
  | "bytes";

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

import type { Readable } from "svelte/store";
import type { ProgressNode } from "./ProgressNode";
import type { NodeConfiguration } from "./ProgressNode/types";
import type ContextMenuItems from "./util/ContextMenuItems";

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
    config: NodeConfiguration,
    allowUnset: boolean,
    callback: (result: NodeConfiguration) => unknown
  ) => void;
};

export type WeightData = {
  title: string;
  abbreviation: string;
  baseValue: number;
}

export type WeightInterpretation = {
  name: string;
  data: WeightData[];

  timeLike: boolean;
}

export type WeightDialogContext = {
  open: (
    config: {
      value: number,
      interpretation?: WeightInterpretation
    },
    parentInterpretation: WeightInterpretation,
    callback: (result: { value: number, interpretation?: WeightInterpretation }) => unknown,
  ) => void;
}

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
    items: ContextMenuItems,
    handler: ContextMenuItemHandler
  ) => Promise<void>;
};

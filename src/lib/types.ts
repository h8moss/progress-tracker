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

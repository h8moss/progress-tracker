import type { WeightInterpretation } from "../types";

export type NodeTheme = {
  name: string;
  textColor: string;
  textColorB: string;
  backgroundColor: string;
  darkenColor: number[];
  highlightColorA: string;
  highlightColorB: string;
};

export type NodeConfiguration = {
  weightInterpretation?: WeightInterpretation;
  colorLabel?: string;
  theme?: NodeTheme;
};

export enum NodeType {
  childful,
  checkbox,
  slider
}

export type ProgressNode = {
  /**
  @param {NodeType} type - The type of the node
  */
  type: NodeType;
  /**
  @param {string} title The title of the node.
  */
  title: string;
  /**
  @param {boolean?} isDone Weather the task is done or not
  */
  isDone?: boolean;
  /**
  @param {ProgressNode[]?} children A list of subtasks for this node.
  */
  children?: ProgressNode[];
  /**
  @param {number?} progress - Progress from 0 to 1 (for sliders)
  */
  progress?: number;
  /**
  @param {number?} weight How important this task is.
  */
  weight?: number;
  /**
  @param {NodeConfiguration} configuration The configuration of the specific 
  node. Configuration cascades
  */
  configuration: NodeConfiguration;
  /**
  @param {string} id A unique identifier for the task
  */
  id: string;
};

export type ProgressNodeNoID = Omit<ProgressNode, "id" | "children"> & {
  children?: ProgressNodeNoID[];
};

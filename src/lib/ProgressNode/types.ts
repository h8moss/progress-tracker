/**
 Describes some task with an importance ({@link ProgressNode["weight"]}), 
 a name ({@link ProgressNode.title}), and optionally, 
 sub-tasks ({@link ProgressNode.children})
 */

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

export type ProgressNode = {
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

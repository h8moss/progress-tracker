/**
 Describes some task with an importance ({@link ProgressNode.weight}), 
 a name ({@link ProgressNode.title}), and optionally, 
 sub-tasks ({@link ProgressNode.children})
 */
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
 @param {number} weight How important this task is.
 */
  weight: number;
};

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

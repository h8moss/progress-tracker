import type { ProgressNode } from "../types";

const setIsDone = (node: ProgressNode, isDone: boolean): ProgressNode => {
  if (node.isDone !== undefined)
    return {
      ...node,
      isDone,
    };

  if (node.children !== undefined) {
    return {
      ...node,
      children: node.children.map((child) => setIsDone(child, isDone)),
    };
  }

  throw "Node is not valid";
};

export default setIsDone;

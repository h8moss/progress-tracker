import type { ProgressNode } from "../types";

const isNodeValid = (node: ProgressNode) => {
  if (node.children)
    return node.isDone === undefined && node.weight === undefined;

  return (
    node.isDone !== undefined &&
    node.weight !== undefined &&
    node.children === undefined
  );
};

export default isNodeValid;

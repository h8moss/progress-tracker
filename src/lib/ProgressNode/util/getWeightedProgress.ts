import type { ProgressNode } from "../types";

const getWeightedProgress = (node: ProgressNode): number => {
  if (!node) return 0;
  if (node.weight && node.isDone !== undefined) {
    return node.isDone ? node.weight : 0;
  }

  if (node.children) {
    if (node.children.length === 0) return 0;
    return node.children
      .map((child) => getWeightedProgress(child))
      .reduce((prev, curr) => prev + curr);
  }

  return 0;
};

export default getWeightedProgress;

import type { ProgressNode } from "../types";

const getWeightedProgress = (node: ProgressNode): number => {
  if (node.weight && node.isDone !== undefined) {
    return node.isDone ? node.weight : 0;
  }

  if (node.children) {
    return node.children
      .map((child) => getWeightedProgress(child))
      .reduce((prev, curr) => prev + curr);
  }

  return 0;
};

export default getWeightedProgress;

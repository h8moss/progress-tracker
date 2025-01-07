import type { ProgressNode } from "../types";
import getTotalWeight from "./getTotalWeight";
import getWeightedProgress from "./getWeightedProgress";

const getIsDone = (node: ProgressNode) => {
  if (node.isDone !== undefined) {
    return node.isDone;
  } else if (node.progress !== undefined) return (1 - node.progress) < 0.001

  return getWeightedProgress(node) === getTotalWeight(node);
};

export default getIsDone;

import type { ProgressNode } from "../types";
import getTotalWeight from "./getTotalWeight";
import getWeightedProgress from "./getWeightedProgress";

const getIsDone = (node: ProgressNode) => {
  if (node.isDone !== undefined) {
    return node.isDone;
  }

  return getWeightedProgress(node) === getTotalWeight(node);
};

export default getIsDone;

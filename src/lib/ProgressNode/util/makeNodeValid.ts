import type { ProgressNode } from "../types";
import isNodeValid from "./isNodeValid";

const makeNodeValid = (node: ProgressNode): ProgressNode => {
  if (isNodeValid(node)) return node;

  if (node.children) {
    return {
      title: node.title,
      children: node.children.map((child) => makeNodeValid(child)),
      isDone: undefined,
      weight: undefined,
    };
  } else {
    return {
      ...node,
      children: [],
    };
  }
};

export default makeNodeValid;

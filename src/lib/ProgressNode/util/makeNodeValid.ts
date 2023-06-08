import type { ProgressNode, ProgressNodeNoID } from "../types";
import generateRandomID from "./generateRandomID";
import isNodeValid from "./isNodeValid";

const makeNodeValid = (n: ProgressNode | ProgressNodeNoID): ProgressNode => {
  const node = generateRandomID(n);
  if (isNodeValid(node)) return node;

  if (node.children) {
    return generateRandomID({
      title: node.title,
      children: node.children.map((child) => makeNodeValid(child)),
      isDone: undefined,
      weight: undefined,
    });
  } else {
    return {
      ...node,
      children: [],
    };
  }
};

export default makeNodeValid;

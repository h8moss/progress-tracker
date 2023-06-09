import type { ProgressNode, ProgressNodeNoID } from "../types";
import { v4 as uuidV4 } from "uuid";

const generateRandomID = (
  node: ProgressNodeNoID | ProgressNode
): ProgressNode => {
  if ("id" in node) return node;

  return {
    ...node,
    children: node.children
      ? node.children.map((v) => generateRandomID(v))
      : undefined,
    id: uuidV4(),
  };
};

export default generateRandomID;

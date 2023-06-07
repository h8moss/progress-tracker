import type { ProgressNode } from "../types";
import copyWith from "./copyWith";

const plusChildren = (
  node: ProgressNode,
  children: ProgressNode[]
): ProgressNode => {
  const oldChildren = node.children ? structuredClone(node.children) : [];
  return copyWith(node, {
    children: [...oldChildren, ...children],
  });
};

export default plusChildren;

import type { ProgressNode } from "../types";

const newChildTitle = (node: ProgressNode, title = "Untitled"): string => {
  let children = node.children;

  if (!children) return "";

  let count = 0;
  const titles = children.map((v) => v.title);
  while (titles.includes(title)) {
    count++;
    title = `Untitled - ${count}`;
  }
  return title;
};

export default newChildTitle;

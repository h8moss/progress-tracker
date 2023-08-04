import type { ProgressNode } from "../types";

const getNodeLabels = (node: ProgressNode | null): string[] => {
  if (!node) return [];

  if (!node.children) {
    return [node.configuration?.colorLabel || "transparent"].filter(
      (v) => v !== "transparent"
    );
  }

  let results: string[] = [];
  for (const child of node.children) {
    results = [...results, ...getNodeLabels(child)];
  }

  return results.filter((v) => v !== "transparent");
};

export default getNodeLabels;

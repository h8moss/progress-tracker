import type { ProgressNode } from "../types";

const getUndoneLabels = (node: ProgressNode | null): string[] => {
  if (!node) return [];

  if (!node.children) {
    if (node.isDone) return [];

    return [node.configuration?.colorLabel || "transparent"].filter(
      (v) => v !== "transparent"
    );
  }

  let results: string[] = [];
  for (const child of node.children) {
    results = [...results, ...getUndoneLabels(child)];
  }

  return results.filter((v) => v !== "transparent");
};

export default getUndoneLabels;

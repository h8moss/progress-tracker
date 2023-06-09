import type { ProgressNode } from "../types";

const copyWith = (
  original: ProgressNode,
  values: Partial<ProgressNode>
): ProgressNode => {
  return {
    ...structuredClone(original),
    ...values,
  };
};

export default copyWith;

import type { ProgressNode } from "../types";
import getNodeLabels from "./getNodeLabels";

const getChildrenLabels = (
  node: ProgressNode | null,
  getLabels = getNodeLabels
) => {
  const c = node?.children || [];

  return c.map((v) => getLabels(v)).flat();
};

export default getChildrenLabels;

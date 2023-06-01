import type { ProgressNode } from "../types";

/** Returns the weight of the node, if the node has children, adds the weight
of the children together.
@param {ProgressNode} node The node whose weight will be returned
@returns {number} The weight of the node
*/
const getTotalWeight = (node: ProgressNode): number => {
  if (!node) return 0;
  let weight = 0;
  if (node.weight) {
    weight += node.weight;
  }
  if (node.children) {
    node.children.map((child) => (weight += getTotalWeight(child)));
  }

  return weight;
};

export default getTotalWeight;

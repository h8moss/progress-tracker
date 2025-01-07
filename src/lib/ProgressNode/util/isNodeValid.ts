import { NodeType, type ProgressNode } from "../types";

const isNodeValid = (node: ProgressNode): boolean => {
  if (node.type === NodeType.childful)
    return (
      node.isDone === undefined &&
      node.weight === undefined &&
      node.progress === undefined &&
      node.children !== undefined &&
      node.children.every((child) => isNodeValid(child))
    );
  if (node.type === NodeType.slider)
    return (
      node.progress !== undefined &&
      node.weight !== undefined &&
      node.isDone === undefined &&
      node.children === undefined
    )
  if (node.type === NodeType.checkbox)
    return (
      node.isDone !== undefined &&
      node.weight !== undefined &&
      node.children === undefined &&
      node.progress === undefined
    );

  throw 'Unimplemented type: ' + node.type;
};

export default isNodeValid;

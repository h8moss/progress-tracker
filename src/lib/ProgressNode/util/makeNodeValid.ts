import { NodeType, type ProgressNode, type ProgressNodeNoID } from "../types";
import generateRandomID from "./generateRandomID";
import isNodeValid from "./isNodeValid";

const makeNodeValid = (n: ProgressNode | ProgressNodeNoID): ProgressNode => {
  const node = generateRandomID(n);
  if (isNodeValid(node)) return node;
  if (node.type === NodeType.checkbox)
    return {
      title: node.title,
      type: node.type,
      id: node.id,
      configuration: node.configuration,


      children: undefined,
      weight: node.weight || 1,
      progress: undefined,
      isDone: node.isDone || false,
    }
  if (node.type === NodeType.slider)
    return {
      title: node.title,
      type: node.type,
      id: node.id,
      configuration: node.configuration,

      children: undefined,
      weight: node.weight || 1,
      progress: node.progress || 0,
      isDone: undefined
    }
  if (node.type === NodeType.childful)
    return {
      title: node.title,
      type: node.type,
      id: node.id,
      configuration: node.configuration,

      children: node.children || [],
      weight: undefined,
      progress: undefined,
      isDone: undefined,
    }

  throw 'Unimplemented type: ' + node.type;
}

export default makeNodeValid;

import type { JSONValue, ProgressNode } from "../types";

/**
 creates a new {@link ProgressNode} using JSON data
 @param json {@link JSONValue} The json map with which to create the node.
 */
const nodeFromJson = (json: JSONValue): ProgressNode => {
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    throw "JSON value does not represent a node";
  }
  const { title, weight, children, isDone } = json;

  if (
    typeof title !== "string" ||
    typeof weight !== "number" ||
    (typeof children !== "undefined" && !Array.isArray(children)) ||
    (typeof isDone !== "undefined" && typeof isDone !== "boolean")
  ) {
    throw "JSON value does not represent a node";
  }

  return {
    title,
    weight,
    children: children
      ? children.map((value) => nodeFromJson(value))
      : undefined,
    isDone,
  };
};

export default nodeFromJson;

import type { JSONValue, ProgressNode } from "../types";
import makeNodeValid from "./makeNodeValid";

/**
 creates a new {@link ProgressNode} using JSON data
 @param json {@link JSONValue} The json map with which to create the node.
 */
const nodeFromJson = (json: JSONValue): ProgressNode => {
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    throw "JSON value does not represent an object, and thus, it can't be a node";
  }
  const { title, weight, children, isDone } = json;

  if (
    typeof title !== "string" ||
    (typeof weight !== "undefined" && typeof weight !== "number") ||
    (typeof children !== "undefined" && !Array.isArray(children)) ||
    (typeof isDone !== "undefined" && typeof isDone !== "boolean")
  ) {
    console.error({
      json,
      title,
      weight,
      children,
      isDone,
    });
    throw "JSON value does not represent a node. Missing either title, weight, children or isDone";
  }

  return makeNodeValid({
    title,
    weight,
    children: children
      ? children.map((value) => nodeFromJson(value))
      : undefined,
    isDone,
  });
};

export default nodeFromJson;

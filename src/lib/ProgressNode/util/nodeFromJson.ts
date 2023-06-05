import type { JSONValue } from "src/lib/types";
import type { NodeConfiguration, ProgressNode } from "../types";
import makeNodeValid from "./makeNodeValid";

const configObjectAsConfiguration = (
  configuration: JSONValue
): NodeConfiguration | null => {
  if (typeof configuration !== "object") return null;
  if (Array.isArray(configuration)) return null;

  return configuration;
};

/**
 creates a new {@link ProgressNode} using JSON data
 @param json {@link JSONValue} The json map with which to create the node.
 */
const nodeFromJson = (json: JSONValue): ProgressNode => {
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    throw "JSON value does not represent an object, and thus, it can't be a node";
  }
  const { title, weight, children, isDone, configuration } = json;
  const config = configObjectAsConfiguration(configuration);

  if (
    typeof title !== "string" ||
    (typeof weight !== "undefined" && typeof weight !== "number") ||
    (typeof children !== "undefined" && !Array.isArray(children)) ||
    (typeof isDone !== "undefined" && typeof isDone !== "boolean") ||
    (typeof configuration !== "undefined" && config === null)
  ) {
    console.error({
      json,
      title,
      weight,
      children,
      isDone,
      configuration,
    });
    throw "JSON value does not represent a node. Missing either title, weight, children, configuration or isDone";
  }

  return makeNodeValid({
    title,
    weight,
    children: children
      ? children.map((value) => nodeFromJson(value))
      : undefined,
    isDone,
    configuration: configuration ? config! : undefined,
  });
};

export default nodeFromJson;

import type { JSONValue } from "../../types";
import { getWeightInterpretations } from "../../util";
import { NodeType, type NodeConfiguration, type ProgressNode } from "../types";
import makeNodeValid from "./makeNodeValid";

const configObjectAsConfiguration = (
  configuration: JSONValue
): NodeConfiguration | null => {
  if (configuration === null) return null;
  if (typeof configuration !== "object") return null;
  if (Array.isArray(configuration)) return null;
  if (typeof configuration.weightInterpretation === "string") {

    const interpretations = getWeightInterpretations();
    let found = false;
    for (const interpretation of interpretations) {
      if (interpretation.name === configuration.weightInterpretation || interpretation.legacyName === configuration.weightInterpretation) {
        configuration.weightInterpretation = interpretation;
        found = true;
      }
    }
    if (!found) {
      configuration.weightInterpretation = interpretations[0];
    }
  }

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
  const { title, weight, children, isDone, configuration, id, type, progress } = json;
  const config = configObjectAsConfiguration(configuration);

  if (
    typeof title !== "string" ||
    (typeof weight !== "undefined" && typeof weight !== "number") ||
    (typeof children !== "undefined" && !Array.isArray(children)) ||
    (typeof isDone !== "undefined" && typeof isDone !== "boolean") ||
    (typeof configuration !== "undefined" && config === null) ||
    (typeof id !== "undefined" && typeof id !== "string") ||
    (typeof type !== "undefined" && typeof type !== "number") ||
    (typeof progress !== "undefined" && typeof progress !== "number")
  ) {
    console.error({
      json,
      title,
      weight,
      children,
      isDone,
      id,
      configuration,
      type,
      progress,
    });
    throw "JSON value does not represent a node. Missing either title, weight, children, configuration or isDone";
  }

  return makeNodeValid({
    title,
    progress,
    type: type === undefined ? (
      children === undefined ? (
        isDone === undefined ? (
          NodeType.slider
        ) : NodeType.checkbox
      ) : NodeType.childful
    ) : type,
    weight,
    children: children
      ? children.map((value) => nodeFromJson(value))
      : undefined,
    isDone,
    configuration: configuration ? config! : {},
  });
};

export default nodeFromJson;

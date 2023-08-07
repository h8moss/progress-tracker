import type { NodeTheme } from "./types";

export const WEIGHT_INTERPRETATIONS = [
  "none",
  "seconds",
  "centimeters",
  "grams",
  "bytes",
] as const;

export const DEFAULT_THEME: NodeTheme = {
  name: "Light",
  backgroundColor: "#fff",
  darkenColor: [0, 0, 0],
  textColor: "#000",
  textColorB: "#2222aa",
  highlightColorA: "#2f99fc",
  highlightColorB: "#2a87ff",
};

export const DARK_THEME: NodeTheme = {
  name: "Dark",
  backgroundColor: "#222",
  darkenColor: [255, 255, 255],
  textColor: "#fff",
  textColorB: "#fff",
  highlightColorA: "#2f99fc",
  highlightColorB: "#2a87ff",
};

export const SUNSET_THEME: NodeTheme = {
  name: "Sunset",
  backgroundColor: "#efddff",
  darkenColor: [255, 55, 0],
  textColor: "#ff5500",
  textColorB: "#990000",
  highlightColorA: "#ff5500",
  highlightColorB: "#ffaa67",
};

export const GLITCH_THEME: NodeTheme = {
  name: "Glitch",
  backgroundColor: "#000",
  darkenColor: [160, 0, 200],
  textColor: "#fff",
  textColorB: "#609",
  highlightColorA: "#9000e0",
  highlightColorB: "#af0ff0",
};

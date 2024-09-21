import { invoke } from "@tauri-apps/api";
import {
  DARK_THEME,
  DEFAULT_THEME,
  GLITCH_THEME,
  SUNSET_THEME,
} from "../ProgressNode/constants";
import type { NodeTheme } from "../ProgressNode/types";
import { appDataDir, join } from "@tauri-apps/api/path";

let themes: null | NodeTheme[] = null;
const defaultThemes: NodeTheme[] = [
  DEFAULT_THEME,
  DARK_THEME,
  SUNSET_THEME,
  GLITCH_THEME,
];

const getThemes = async (): Promise<NodeTheme[]> => {
  if (!themes) {
    const dataDir = await appDataDir();
    const path = await join(dataDir, "\\themes");

    const customThemesData = (await invoke("read_folder", {
      path,
    })) as string[];

    const customThemes = customThemesData.map(
      (v) => JSON.parse(v) as NodeTheme
    );

    themes = [...defaultThemes, ...customThemes];
  }

  return themes;
};

export default getThemes;

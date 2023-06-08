import { invoke } from "@tauri-apps/api/tauri";
import nodeFromJson from "./nodeFromJson";
import type { ProgressNode } from "../types";

const nodeFromJsonPath = async (path: string): Promise<ProgressNode> => {
  const content = (await invoke("read_file", { path: path })) as string;
  const json = JSON.parse(content);
  return nodeFromJson(json);
};

export default nodeFromJsonPath;

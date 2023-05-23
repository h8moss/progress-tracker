import { invoke } from "@tauri-apps/api/tauri";
import nodeFromJson from "./nodeFromJson";

const nodeFromJsonPath = async (path: string) => {
  const content = (await invoke("read_file", { path: path })) as string;
  const json = JSON.parse(content);
  return nodeFromJson(json);
};

export default nodeFromJsonPath;

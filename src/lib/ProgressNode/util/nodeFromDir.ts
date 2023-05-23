import { readDir, exists } from "@tauri-apps/api/fs";
import type { ProgressNode } from "../types";
import { invoke } from "@tauri-apps/api";
import makeNodeValid from "./makeNodeValid";

const notNullOrUndefined = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};

const isFileVideo = (path: string) => {
  const extension = path.split(".").at(-1);
  if (!extension) return false;
  return ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"].includes(
    extension.toLowerCase()
  );
};

const nodeFromDir = async (path: string): Promise<ProgressNode | null> => {
  if (await exists(path)) {
    const entries = await readDir(path);
    return makeNodeValid({
      title: path.split("\\").at(-1) ?? "",
      children: (await Promise.all(entries.map((e) => handleEntry(e)!))).map(
        (v) => v!
      ),
    });
  }
  return null;
};

type Entry = {
  children?: Entry[] | undefined;
  name?: string | undefined;
  path: string;
};

const handleEntry = async (entry: Entry): Promise<ProgressNode | null> => {
  if (!entry.name) return null;

  const isFile = !entry.children;
  if (isFile && !isFileVideo(entry.path)) return null;

  let children: ProgressNode[] | undefined = undefined;

  if (!isFile) {
    children = (
      await Promise.all(
        (await readDir(entry.path)).map((entry) => handleEntry(entry))
      )
    ).filter(notNullOrUndefined);
  }

  const isDone = isFile ? false : undefined;

  const weight = isFile
    ? Math.floor(
        (await invoke("get_video_duration", { path: entry.path })) as number
      )
    : undefined;

  const title = entry.name.split(".").at(0) ?? entry.name;

  return {
    title,
    children,
    isDone,
    weight,
  };
};

export default nodeFromDir;

import type { ProgressNode } from "../types";
import { readDir, type FileEntry } from "@tauri-apps/api/fs";
import generateRandomID from "./generateRandomID";
import { invoke } from "@tauri-apps/api";
import { sep } from "@tauri-apps/api/path";
import naturalCompare from "natural-compare-lite";

const isVideoFile = (path: string) => {
  const extension = path.split(".").at(-1);
  if (!extension) return false;
  return ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"].includes(
    extension.toLowerCase()
  );
};

const getTotalFileCount = (entries: FileEntry[]): number => {
  let count = 0;
  for (const entry of entries) {
    const isFile = entry.children === undefined;
    if (isFile && isVideoFile(entry.path)) count++;
    else if (!isFile) count += getTotalFileCount(entry.children!);
  }

  return count;
};

const getBaseName = (
  path: string,
  { ignoreExtension } = { ignoreExtension: false }
): string => {
  const extensionFull = path.split(sep).at(-1) || "";

  if (ignoreExtension) return extensionFull;
  const extensionSplit = extensionFull.split(".");
  return extensionSplit.length === 0
    ? ""
    : extensionSplit.length === 1
    ? extensionSplit[0]
    : extensionSplit.slice(0, -1).join(".");
};

const getVideoFileWeight = async (path: string) => {
  return Math.floor((await invoke("get_video_duration", { path })) as number);
};

const nodesFromDirs = async (
  entries: FileEntry[],
  options: { onFileNode?: () => unknown }
): Promise<ProgressNode[]> => {
  let results: ProgressNode[] = [];

  for (const entry of entries) {
    const isFile = entry.children === undefined;
    const title = getBaseName(entry.path, { ignoreExtension: !isFile });

    if (isFile && isVideoFile(entry.path)) {
      const weight = await getVideoFileWeight(entry.path);

      if (options.onFileNode) options.onFileNode();

      results = [
        ...results,
        generateRandomID({
          title,
          isDone: false,
          weight,
        }),
      ];
    } else if (!isFile) {
      results = [
        ...results,
        generateRandomID({
          title,
          children: await nodesFromDirs(entry.children!, options),
        }),
      ];
    }
  }

  return results.sort((a, b) =>
    naturalCompare(a.title.toLowerCase(), b.title.toLowerCase())
  );
};

const nodeFromDir = async (
  path: string,
  progressCallback: (current: number) => unknown = () => {}
): Promise<ProgressNode | null> => {
  const children = await readDir(path, { recursive: true });

  const title = getBaseName(path, { ignoreExtension: true });
  const totalCount = getTotalFileCount(children);

  let progress = 0;

  if (!children) return null;
  return generateRandomID({
    title,
    children: await nodesFromDirs(children, {
      onFileNode: () => progressCallback(++progress / totalCount),
    }),
    configuration: {
      weightInterpretation: "seconds",
    },
  });
};

export default nodeFromDir;

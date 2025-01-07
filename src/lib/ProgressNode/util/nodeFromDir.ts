import { NodeType, type ProgressNode } from "../types";
import { readDir, type FileEntry } from "@tauri-apps/plugin-fs";
import generateRandomID from "./generateRandomID";
import { invoke } from "@tauri-apps/api/core";
import { sep } from "@tauri-apps/api/path";
import naturalCompare from "natural-compare-lite";
import { getWeightInterpretations } from "../../util";

const isVideoFile = (p: string): boolean => {
  console.log(p);
  const extension = p.split(".").at(-1);
  if (!extension) return false;
  return ["mp4", "mkv", "avi", "mov", "wmv", "flv", "webm"].includes(
    extension.toLowerCase()
  );
};

const getTotalFileCount = (entries: FileEntry[]): number => {
  let count = 0;
  for (const entry of entries) {
    console.log({ entry });
    const isFile = entry.children === undefined;
    if (isFile && isVideoFile(entry.name)) count++;
    else if (!isFile) count += getTotalFileCount(entry.children!);
  }

  return count;
};

const getBaseName = (
  p: string,
  { ignoreExtension } = { ignoreExtension: false }
): string => {
  const extensionFull = p.split(sep()).at(-1) || "";

  if (ignoreExtension) return extensionFull;
  const extensionSplit = extensionFull.split(".");
  return extensionSplit.length === 0
    ? ""
    : extensionSplit.length === 1
      ? extensionSplit[0]
      : extensionSplit.slice(0, -1).join(".");
};

const getVideoFileWeight = async (path: string): Promise<number> => {
  console.log({ path, vfw: true });
  return Math.floor((await invoke("get_video_duration", { path })) as number);
};

const nodesFromDirs = async (
  entries: FileEntry[],
  options: { onFileNode?: () => unknown, parentPath: string }
): Promise<ProgressNode[]> => {
  let results: ProgressNode[] = [];

  for (const entry of entries) {
    console.log({ entry });
    const isFile = entry.isFile;
    const title = entry.name;

    if (isFile && isVideoFile(entry.name)) {
      const path = options.parentPath + sep() + entry.name;
      const weight = await getVideoFileWeight(path);

      if (options.onFileNode) options.onFileNode();

      results = [
        ...results,
        generateRandomID({
          type: NodeType.checkbox,
          title,
          isDone: false,
          weight,
          configuration: {}
        }),
      ];
    } else if (!isFile) {
      results = [
        ...results,
        generateRandomID({
          type: NodeType.childful,
          title,
          children: await nodesFromDirs(entry.children!, options),
          configuration: {}
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
  progressCallback: (current: number) => unknown = () => { }
): Promise<ProgressNode | null> => {
  const children = await readDir(path);

  const title = getBaseName(path, { ignoreExtension: true });
  const totalCount = getTotalFileCount(children);

  let progress = 0;

  if (!children) return null;
  const result = generateRandomID({
    type: NodeType.childful,
    title,
    children: await nodesFromDirs(children, {
      parentPath: path,
      onFileNode: () => progressCallback(++progress / totalCount),
    }),
    configuration: {
      weightInterpretation: getWeightInterpretations()[1],
    },
  });
  console.log({ result });
  return result;
};

export default nodeFromDir;

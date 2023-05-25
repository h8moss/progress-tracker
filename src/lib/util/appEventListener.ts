import { emit, listen, type Event } from "@tauri-apps/api/event";
import { get, type Readable, type Writable } from "svelte/store";
import type { ProgressNode } from "../ProgressNode";
import { open, save } from "@tauri-apps/api/dialog";
import { nodeFromDir, nodeFromJsonPath } from "../ProgressNode/util";
import { invoke } from "@tauri-apps/api";

interface Args {
  progressNode: Writable<ProgressNode | null>;
  isLoading: Writable<boolean>;
  path: Writable<string | null>;
  needsSave: Writable<boolean>;
}

const progressFilters = [
  {
    name: "Progress",
    extensions: ["prog"],
  },
  {
    name: "Json",
    extensions: ["json"],
  },
];

const appEventListener = async ({
  progressNode,
  isLoading,
  path,
  needsSave,
}: Args) => {
  let unlistenArr: (() => void)[] = [];

  unlistenArr = [
    ...unlistenArr,
    await listen("new", (_) => {
      progressNode.set({
        title: "Untitled",
        children: [],
      });
      isLoading.set(false);
      path.set(null);
      needsSave.set(true);
    }),
  ];

  unlistenArr = [
    ...unlistenArr,
    await listen("new-folder", async (_) => {
      const selection = await open({
        directory: true,
        title: "Pick a folder",
        multiple: false,
      });

      if (selection && !Array.isArray(selection)) {
        isLoading.set(true);
        const result = await nodeFromDir(selection);
        isLoading.set(false);
        if (result) {
          progressNode.set({
            ...result,
            configuration: {
              weightInterpretation: "seconds",
            },
          });
        }
        path.set(null);
        needsSave.set(true);
      }
    }),
  ];

  unlistenArr = [
    ...unlistenArr,
    await listen("open", async (_) => {
      const selection = await open({
        directory: false,
        filters: progressFilters,
        multiple: false,
        title: "Select a file",
      });

      if (selection && !Array.isArray(selection)) {
        progressNode.set(await nodeFromJsonPath(selection));
      }
    }),
  ];

  unlistenArr = [
    ...unlistenArr,
    await listen("save-as", async (_) => {
      const selection = await save({
        filters: progressFilters,
      });
      if (selection) {
        path.set(selection);
        emit("save", selection);
      }
    }),
  ];

  unlistenArr = [
    ...unlistenArr,
    await listen("get-save-path", async (_) => {
      if (get(path)) {
        emit("save", get(path));
      } else {
        emit("save-as", "");
      }
    }),
  ];

  unlistenArr = [
    ...unlistenArr,
    await listen("save", async (event: Event<string>) => {
      const currentProgressNode = get(progressNode);
      if (currentProgressNode) {
        await invoke("write_file", {
          path: event.payload,
          value: JSON.stringify(currentProgressNode),
        });
        needsSave.set(false);
      }
    }),
  ];

  return () => {
    for (const unlisten of unlistenArr) {
      unlisten();
    }
  };
};

export default appEventListener;

import { emit, listen, type Event } from "@tauri-apps/api/event";
import { get, type Writable } from "svelte/store";
import type { ProgressNode } from "../ProgressNode";
import { open, save } from "@tauri-apps/api/dialog";
import {
  makeNodeValid,
  nodeFromDir,
  nodeFromJsonPath,
} from "../ProgressNode/util";
import { invoke } from "@tauri-apps/api";
import { appWindow } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/api/dialog";

interface Args {
  progressNode: Writable<ProgressNode | null>;
  isLoading: Writable<number | null>;
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
  let unlistenArr: (() => void)[] = [
    await listen("new", (_) => {
      progressNode.set(
        makeNodeValid({
          title: "Untitled",
          children: [
            {
              title: "Task 1",
              weight: 1,
              isDone: false,
            },
          ],
        })
      );
      isLoading.set(null);
      path.set(null);
      needsSave.set(true);
    }),
    await listen("new-folder", async (_) => {
      const selection = await open({
        directory: true,
        title: "Pick a folder",
        multiple: false,
      });

      if (selection && !Array.isArray(selection)) {
        isLoading.set(0.0);
        const result = await nodeFromDir(selection, (v) => {
          isLoading.set(v * 100);
          console.log({ v });
        });
        isLoading.set(null);
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
    await listen("open", async (_) => {
      const selection = await open({
        directory: false,
        filters: progressFilters,
        multiple: false,
        title: "Select a file",
      });

      if (selection && !Array.isArray(selection)) {
        progressNode.set(await nodeFromJsonPath(selection));
        path.set(selection);
      }
    }),
    await listen("save-as", async (_) => {
      const selection = await save({
        filters: progressFilters,
      });
      if (selection) {
        path.set(selection);
        emit("save", selection);
      }
    }),
    await listen("get-save-path", async (_) => {
      if (get(path)) {
        emit("save", get(path));
      } else {
        emit("save-as", "");
      }
    }),
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
    await appWindow.onCloseRequested(async (event) => {
      if (get(needsSave)) {
        const confirmed = await confirm("Save before closing?", {
          cancelLabel: "No",
          okLabel: "Yes",
        });

        if (confirmed) {
          await emit("get-save-path");
        }
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

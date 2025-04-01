import { emit, listen, type Event } from "@tauri-apps/api/event";
import { get, type Writable } from "svelte/store";
import type { ProgressNode } from "../ProgressNode";
import { open, save } from "@tauri-apps/plugin-dialog";
import {
  makeNodeValid,
  nodeFromDir,
  nodeFromJsonPath,
} from "../ProgressNode/util";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { confirm } from "@tauri-apps/plugin-dialog";
import { NodeType } from "../ProgressNode/types";

const appWindow = getCurrentWebviewWindow()

interface Args {
  progressNode: Writable<ProgressNode | null>;
  isLoading: Writable<number | null>;
  path: Writable<string | null>;
  needsSave: Writable<boolean>;
}

const confirmQuit = async (needsSave: Writable<boolean>): Promise<boolean> => {
  if (get(needsSave)) {
    return await confirm("Save before closing?", {
      cancelLabel: "No",
      okLabel: "Yes",
    });
  }
  return true;
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
}: Args): Promise<() => unknown> => {
  let unlistenArr: (() => void)[] = [
    await listen("new", (_) => {
      progressNode.set(
        makeNodeValid({
          title: "Untitled",
          type: NodeType.childful,
          configuration: {},
          children: [
            {
              type: NodeType.checkbox,
              title: "Task 1",
              weight: 1,
              isDone: false,
              configuration: {},
            },
          ],
        })
      );
      isLoading.set(null);
      path.set(null);
      console.log("NEEDED SAVE 1");
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
          progressNode.set(result);
        }
        path.set(null);
        console.log("NEEDED SAVE 2");
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
    await listen("quit", async (event) => {
      if (await confirmQuit(needsSave)) {
        await emit("get-save-path");
      }
      emit('quit-true', '');
    }),
    await appWindow.onCloseRequested(async (event) => {
      if (await confirmQuit(needsSave)) {
        await emit('get-save-path')
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

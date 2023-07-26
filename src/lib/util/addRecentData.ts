import { invoke } from "@tauri-apps/api";

interface Params {
  title: string;
  path: string;
}

const addRecentData = async ({ title, path }: Params) => {
  const currentDataStr = (await invoke("read_file", {
    path: "./recent.json",
  })) as string;
  const currentDataJSON = JSON.parse((currentDataStr as string) || "[]");

  let newData = structuredClone(currentDataJSON) as Params[];
  if (
    newData.length > 0 &&
    newData[0].path === path &&
    newData[0].title === title
  ) {
    return;
  }

  const currentIndex = newData.findIndex((v) => v.path === path);

  if (currentIndex !== -1) {
    newData.splice(currentIndex, 1);
  }

  newData = [...newData, { title, path }];
  await invoke("write_file", {
    path: "./recent.json",
    value: JSON.stringify(newData),
  });
  console.log("DONE");
};

export default addRecentData;

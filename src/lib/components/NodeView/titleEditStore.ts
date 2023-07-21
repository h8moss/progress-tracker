import { derived, get, writable } from "svelte/store";

const titleEditStore = (
  initialTitle: string,
  onDone: (title: string) => unknown
) => {
  const title = writable(initialTitle);
  const editableTitle = writable(initialTitle);
  const canEdit = writable(false);

  const onEditStarted = () => {
    canEdit.set(true);
    editableTitle.set(get(title));
  };
  const onEditDone = () => {
    canEdit.set(false);
    onDone(get(title));
  };

  const combined = derived([title, canEdit], ([title, canEdit]) => ({
    title,
    canEdit,
  }));

  return {
    ...combined,

    editableTitle,

    onEditDone,
    onEditStarted,
  };
};

export default titleEditStore;

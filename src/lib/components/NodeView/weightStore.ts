import type { WeightInterpretation } from "src/lib/types";
import { interpretWeight } from "../../util";
import { derived, get, writable } from "svelte/store";

const weightStore = (
  initialWeight: number,
  interpretation: WeightInterpretation,
  onDone: (finalWeight: number) => unknown
) => {
  const weight = writable(initialWeight);
  const editableWeight = writable(initialWeight);

  const interpreted = derived(weight, ($weight) =>
    interpretWeight({ weight: $weight, weightInterpretation: interpretation })
  );
  const editableInterpreted = derived(editableWeight, ($weight) =>
    interpretWeight({ weight: $weight, weightInterpretation: interpretation })
  );

  const isEditingWeight = writable(false);

  const onStartEditing = () => {
    isEditingWeight.set(true);
    editableWeight.set(get(weight));
  };
  const onFinishEditing = () => {
    isEditingWeight.set(false);
    onDone(get(editableWeight));
  };

  const combined = derived(
    [interpreted, editableInterpreted, isEditingWeight],
    ([interpreted, editableInterpreted, isEditing]) => ({
      interpreted,
      editableInterpreted,
      isEditing,
    })
  );

  return {
    ...combined,

    editableWeight,
    onStartEditing,
    onFinishEditing,
  };
};

export default weightStore;

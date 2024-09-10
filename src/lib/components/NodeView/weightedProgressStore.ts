import type { WeightInterpretation } from "src/lib/types";
import { interpretWeight } from "../../util";
import { cubicOut } from "svelte/easing";
import { tweened } from "svelte/motion";
import { derived, writable } from "svelte/store";

const weightedProgressStore = (weightInterpretation: WeightInterpretation, initialValue = 0) => {
  const weightedProgress = writable(initialValue);
  const tweenedWeightedProgress = tweened(initialValue, {
    duration: 200,
    easing: cubicOut,
  });

  const interpreted = derived(tweenedWeightedProgress, ($value) =>
    interpretWeight({
      weight: $value,
      weightInterpretation,
    })
  );

  const { subscribe } = derived(
    [tweenedWeightedProgress, interpreted],
    ([progress, interpretation]) => ({
      progress,
      interpretation,
    })
  );

  const set = (v: number) => {
    weightedProgress.set(v);
    tweenedWeightedProgress.set(v);
  };

  return {
    subscribe,
    set,
  };
};

export default weightedProgressStore;

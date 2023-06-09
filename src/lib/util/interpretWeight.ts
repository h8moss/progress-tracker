import type { WeightInterpretation } from "../types";

const numberToUnit = ({
  num,
  baseUnit,
  greaterUnits,
}: {
  num: number;
  baseUnit: string;
  greaterUnits: {
    name: string;
    baseUnitSize: number;
  }[];
}) => {
  greaterUnits.sort((a, b) => a.baseUnitSize - b.baseUnitSize);

  for (let unit of greaterUnits) {
    if (num > unit.baseUnitSize) {
      return (num / unit.baseUnitSize).toFixed(2) + unit.name;
    }
  }
  return num.toFixed(2) + baseUnit;
};

const weightToSeconds = (w: number) => {
  let s = w;
  let m = 0;
  let h = 0;

  while (s >= 60) {
    m++;
    s -= 60;

    if (m >= 60) {
      m = 0;
      h++;
    }
  }

  return `${h}:${m}:${s.toFixed(2)}`;
};

const weightToGrams = (weight: number) =>
  numberToUnit({
    baseUnit: "g",
    greaterUnits: [
      {
        baseUnitSize: 1000,
        name: "kg",
      },
    ],
    num: weight,
  });

const weightToCentimeters = (weight: number) =>
  numberToUnit({
    baseUnit: "cm",
    greaterUnits: [
      { baseUnitSize: 100, name: "m" },
      { baseUnitSize: 100000, name: "km" },
    ],
    num: weight,
  });

const weightToBytes = (weight: number) =>
  numberToUnit({
    baseUnit: "B",
    greaterUnits: [
      {
        baseUnitSize: 1000,
        name: "KB",
      },
      {
        baseUnitSize: 1000 * 1000,
        name: "MB",
      },
      {
        baseUnitSize: 1000 * 1000 * 1000,
        name: "GB",
      },
      {
        baseUnitSize: 1000 * 1000 * 1000 * 1000,
        name: "TB",
      },
    ],
    num: weight,
  });

const interpretWeight = ({
  weight,
  weightInterpretation,
}: {
  weight: number;
  weightInterpretation: WeightInterpretation;
}): string => {
  switch (weightInterpretation) {
    case "bytes":
      return weightToBytes(weight);
    case "centimeters":
      return weightToCentimeters(weight);
    case "grams":
      return weightToGrams(weight);
    case "none":
      return weight.toFixed(2);
    case "seconds":
      return weightToSeconds(weight);
    default:
      throw `Interpretation not yet implemented (${weightInterpretation})`;
  }
};

export default interpretWeight;

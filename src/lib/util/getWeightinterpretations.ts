import type { WeightInterpretation } from "../types";

const getWeightInterpretations = (): WeightInterpretation[] => {
  return [
    { name: "none", data: [], timeLike: false },
    {
      name: "time", data: [
        { title: "Seconds", abbreviation: 's', baseValue: 1 },
        { title: "Minutes", abbreviation: 'm', baseValue: 60 },
        { title: "Hours", abbreviation: 'h', baseValue: 3600 },
      ],
      timeLike: true,
      legacyName: "seconds"
    },
    {
      name: "mass", data: [
        { title: "Grams", abbreviation: "g", baseValue: 1 },
        { title: "Kilograms", abbreviation: "Kg", baseValue: 1000 },
        { title: "Tons", abbreviation: "ton", baseValue: 1000 * 1000 },
      ], timeLike: false,
      legacyName: "grams"
    },
    {
      name: "distance", data: [
        { title: "Centimeters", abbreviation: "cm", baseValue: 1 },
        { title: "Meters", abbreviation: "m", baseValue: 100 },
        { title: "Kilometers", abbreviation: "Km", baseValue: 100000 },
      ], timeLike: false,
      legacyName: "centimeters"
    },
    {
      name: "data", data: [
        { title: "Bytes", abbreviation: "B", baseValue: 1 },
        { title: "KiloBytes", abbreviation: "KB", baseValue: 1024 },
        { title: "MegaBytes", abbreviation: "MB", baseValue: 1024 * 1024 },
        { title: "GigaBytes", abbreviation: "GB", baseValue: 1024 * 1024 * 1024 },
        { title: "TeraBytes", abbreviation: "TB", baseValue: 1024 * 1024 * 1024 * 1024 },
        { title: "PetaBytes", abbreviation: "PB", baseValue: 1024 * 1024 * 1024 * 1024 * 1024 },
      ], timeLike: false,
      legacyName: "bytes"
    },
  ]
};

export default getWeightInterpretations;

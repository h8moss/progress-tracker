import type { WeightInterpretation } from "../types";
import reversedList from "./reversedList";

const fixedTrailingZeros = (n: number, trailing: number, decimals: number) => {
  let [left, right] = n.toFixed(decimals || 1).split(".")

  while (left.length < trailing) {
    left = `0${left}`
  }
  if (decimals == 0) return left.toString();
  return `${left}.${right}`
}

const interpretTimeLike = (weight: WeightInterpretation, n: number) => {

  let units = [...weight.data]
  units = reversedList(units);

  let remain = n;
  let result = '';

  for (let i = 0; i < units.length - 1; i++) {
    const unit = units[i];
    const value = Math.floor(remain / unit.baseValue);
    remain -= value * unit.baseValue;
    result += fixedTrailingZeros(value, 2, 0) + ':';
  }
  result += fixedTrailingZeros(remain, 2, 2);

  return result;
}

const interpretWeight = (weight: WeightInterpretation, n: number) => {
  console.log({ weight, n });
  if (weight.timeLike) return interpretTimeLike(weight, n);

  if (weight.data.length === 0) return n.toFixed(2);

  for (let index = weight.data.length - 1; index >= 0; index--) {
    const data = weight.data[index];
    if (n > data.baseValue) {
      return (n / data.baseValue).toFixed(2) + data.abbreviation;
    }
  }
  return n.toFixed(2) + weight.data[0].abbreviation;
}

export default interpretWeight;


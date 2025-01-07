const reversedList = <T>(l: T[]): T[] => {
  const copied = structuredClone(l);
  copied.reverse();

  return copied;
}

export default reversedList;

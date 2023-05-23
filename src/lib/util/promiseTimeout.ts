const promiseTimeout = (ms: number): Promise<void> =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

export default promiseTimeout;

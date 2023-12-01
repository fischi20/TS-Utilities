/**
 *This function allows you to throw an error as an expression
 * @param message
 * @example const isBiggerThanTen = value > 10 || riseError("This is an error")
 */
export function riseError(message: string): never {
  throw new Error(message);
}

/**
 * This function transforms a try catch function call to a promise
 * @param fn
 * @example tryAsync(() => { ... }).then(console.log).catch(console.log)
 */
export function tryAsync<R>(fn: () => R): Promise<R> {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn());
    } catch (e) {
      reject(e);
    }
  });
}

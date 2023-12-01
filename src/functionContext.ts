/* EXAMPLE

const object = {
  value: "foo",
};
type Obj = typeof object;

function getObject() {
  return object;
}

const fn = contextualizeFunction(getObject, function () {
  console.log(this.value);
});

fn();
object.value = "bar";
fn();
*/

import { resolveParam, type Param } from "./types";

export function contextualizeFunction<T, A extends any[], R>(
  thisArg: Param<T>,
  fn: (this: T, ...args: A) => R
): (...args: A) => R {
  return function (...args: A) {
    const arg = resolveParam(thisArg);
    return fn.apply(arg, args);
  };
}

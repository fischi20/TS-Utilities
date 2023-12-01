type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export type U8 = IntRange<0, 256>;

type ConditionFunction<T> = (value: T) => boolean;
export type Condition<T> = T | ConditionFunction<T>;

export type ParamFn<T> = () => T;
export type Param<T> = T | ParamFn<T>;

export function resolveParam<T>(param: Param<T>): T {
  if (typeof param === "function") {
    return (param as ParamFn<T>)();
  }
  return param;
}

export function checkCondition<T>(condition: Condition<T>, value: T): boolean {
  if (typeof condition === "function") {
    return (condition as ConditionFunction<T>)(value);
  }
  return condition === value;
}

// OPTIMIZATION
// The returned matchers function always return the above
// defined result if not cascading

import { Condition, checkCondition } from "./types";

type Default<R> = {
  (): R;
};

type Fn = () => void;

type Case<T, R> = {
  (): R;
} & Match<T, R>;

type CaseOptions = {
  cascade: Fn;
};

type DefaultHandler<T, R> = (value: T) => R;
type CaseHandler<T, CR> = (options: CaseOptions, value: T) => CR;
type CaseArgs<T, CR> = readonly [
  Condition<T>,
  ...Condition<T>[],
  CaseHandler<T, CR>
];

type Match<T, R> = {
  default: <CR>(
    handler: DefaultHandler<T, R | CR | undefined>
  ) => Default<R | CR | undefined>;
  case: <CR>(...args: CaseArgs<T, CR>) => Case<T, R | CR | undefined>;
};

function createMatcher<T, R>(
  value: T,
  previousReturn: R | undefined = undefined,
  performCascade: boolean = false,
  return_set: boolean = false
) {
  const cascade = () => {
    performCascade = true;
  };
  const matcher: Match<T, R> = {
    default:
      <CR>(handler: DefaultHandler<T, CR>) =>
      () => {
        let returnValue: R | CR | undefined = previousReturn;
        if (performCascade || !return_set) {
          returnValue = handler(value);
        }
        return returnValue;
      },
    case: <CR>(...args: CaseArgs<T, CR>) => {
      const [condition, ...a] = args;
      const handler = a.pop() as CaseHandler<T, CR>;
      const otherConditions = a as Condition<T>[];

      let returnValue: R | CR | undefined = previousReturn;
      if (
        performCascade ||
        checkCondition(condition, value) ||
        (otherConditions.some((cond) => checkCondition(cond, value)) &&
          !return_set)
      ) {
        return_set = true;
        returnValue = handler({ cascade }, value);
      }
      return Object.assign(
        () => returnValue,
        createMatcher<T, R | CR | undefined>(
          value,
          returnValue,
          performCascade,
          return_set
        )
      );
    },
  };
  return matcher;
}

export function match<T = unknown>(value: T): Match<T, undefined> {
  let matcher = createMatcher<T, undefined>(value);
  return matcher;
}

// decorator to add a class to a list of classes

export type Constructor = new (...args: any[]) => any;

export function createClassDecorator<A extends any[]>(
  handler: (construcor: Constructor, ...args: A) => void | Constructor
) {
  return function (...args: A) {
    return function (target: Constructor) {
      return handler(target, ...args);
    };
  };
}

export function createClassDecoratorWithoutArguments(
  handler: (construcor: Constructor) => void | Constructor
) {
  return function (target: Constructor) {
    return handler(target);
  };
}

/**
 * This method uses the decorator factory pattern to create a method decorator
 * @param handler Handler that excepts the 3 base props of a method decorator + any argument
 * you want to pass to the decorator when using it
 * @returns
 * @example
 * ```ts
 *  const printMethodInfoWithProp = createMethodDecorator(
      (target, key, descriptor: PropertyDescriptor, msg: string) => {
        //TODO your code here
      }
    );

    class Test {
      @printMethodInfoWithProp("Hello")
      someMethod(str: string) {}
    }
 * ```
 */
export function createMethodDecorator<T, A extends any[], K extends keyof T>(
  handler: (
    target: T,
    key: string,
    descriptor: PropertyDescriptor,
    ...args: A
  ) => any
) {
  return function (...args: A) {
    return function (target: T, key: string, descriptor: PropertyDescriptor) {
      return handler(target, key, descriptor, ...args);
    };
  };
}

export function createMethodDecoratorWithoutArguments<T>(
  handler: (target: T, key: string, descriptor: PropertyDescriptor) => void
) {
  return function (target: T, key: string, descriptor: PropertyDescriptor) {
    return handler(target, key, descriptor);
  };
}

export function createPropertyDecorator<T, A extends any[]>(
  handler: (target: T, key: string, ...args: A) => void
) {
  return function (...args: A) {
    return function (target: T, key: string) {
      return handler(target, key, ...args);
    };
  };
}

export function createPropertyDecoratorWithoutArguments<T>(
  handler: (target: T, key: string) => void
) {
  return function (target: T, key: string) {
    return handler(target, key);
  };
}

export function createParameterDecorator<T, A extends any[]>(
  handler: (target: T, key: string, index: number, ...args: A) => void
) {
  return function (...args: A) {
    return function (target: T, key: string, index: number) {
      return handler(target, key, index, ...args);
    };
  };
}

export function createParameterDecoratorWithoutArguments<T>(
  handler: (target: T, key: string, index: number) => void
) {
  return function (target: T, key: string, index: number) {
    return handler(target, key, index);
  };
}

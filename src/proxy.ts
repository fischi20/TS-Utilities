// functional typesafe proxy builder

type ObjectTraps<T extends object> = {
  getters: {
    [K in keyof T]?: (val: T[K]) => T[K];
  };
  setters: {
    [K in keyof T]?: (target: T, newVal: T[K], oldVal: T[K]) => boolean;
  };
};

type FunctionTraps<T, A extends any[], R> = {
  apply?: (target: (this: T, ...args: A) => R, thisArg: any, argArray: A) => R;
};

export class ObjectProxyBuilder<T extends object> {
  private handlers: ObjectTraps<T> = {
    getters: {},
    setters: {},
  };

  constructor(private target: T) {}

  get<K extends keyof T>(key: K, handler: (val: T[K]) => T[K]) {
    this.handlers.getters[key] = handler;
    return this;
  }

  /**
   * This behavious behaves similar than the trap in the Proxy API, but Reflect.set doesn't work
   * So You need to use target.prop = newVal instead
   * @param key
   * @param handler
   * @returns
   */
  set<K extends keyof T>(
    key: K,
    handler: (target: T, newVal: T[K], oldVal: T[K]) => boolean
  ) {
    this.handlers.setters[key] = handler;
    return this;
  }

  build(newTarget?: T) {
    const currentTarget = newTarget || this.target;
    return new Proxy(currentTarget, {
      get: (target, key) => {
        const getter = this.handlers.getters[key as keyof T];
        if (getter) {
          return getter(target[key as keyof T]);
        }
        return target[key as keyof T];
      },
      set: (target, key, newVal) => {
        const setter = this.handlers.setters[key as keyof T];
        if (setter) {
          return setter(target, newVal as T[keyof T], target[key as keyof T]);
        }
        // default setter
        target[key as keyof T] = newVal as T[keyof T];
        return true;
      },
    });
  }
}

export class FunctionProxyBuilder<T, A extends any[], R> {
  private handlers: FunctionTraps<T, A, R> = {};

  constructor(private target: (this: T, ...args: A) => R) {}

  apply(
    handler: (
      target: (this: T, ...args: A) => R,
      thisArg: any,
      argArray: A
    ) => R
  ) {
    this.handlers.apply = handler;
    return this;
  }

  build(newTarget?: (this: T, ...args: A) => R) {
    const currentTarget = newTarget || this.target;
    return new Proxy(currentTarget, {
      apply: (target, thisArg, argArray) => {
        const apply = this.handlers.apply;
        if (apply) {
          return apply(target, thisArg, argArray as A);
        }
        return target.apply(thisArg, argArray as A);
      },
    });
  }
}

export function objectProxiyBuilder<T extends object>(target: T) {
  return new ObjectProxyBuilder(target);
}

export function functionProxyBuilder<T, A extends any[], R>(
  target: (this: T, ...args: A) => R
) {
  return new FunctionProxyBuilder(target);
}

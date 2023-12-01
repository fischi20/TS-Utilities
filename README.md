# ATSUL (Anoying typescript utility library)

This is a small library with various utilities that might come in handy for some specific edge cases or
for some library development.
If you want to use decorators, you need to enable decorators in the TS config.
It's a just for fun project where I tried to make helper functions etc.
The guards and the Error helpers are very questionable, as of now, I may revamp them in the future or drop them.

#### Lib parts

##### Anoying/Rare things where I need docs for it

- Proxy
- Decorators
- Bind a custom "this" to a function

The main reason is that I rarely do it, and therefore need to open docs, with the helper functions
this should be a lot easier now. Also for example proxy and decorators use a lot of any in the docs, this should help with that too.

##### Helpers

- Guards
- Error helpers

The general helpers are open for discussion since I'm not sure if I should keep them, change them or remove them.

##### Utility

- Utility Types
- Utility Control Flows

## Usage

### Proxy

There are 2 Proxys, object proxy and function proxies

Object Proxies can intercept when a property is set or get, this are by far the most common ones

```ts
const object = {
  value: "foo",
};

const objProxy = objectProxiyBuilder(object)
  .get("value", (val) => {
    return val + "bar";
  })
  .set("value", (target, newVal, oldVal) => {
    console.log("set value");
    return true;
  })
  .build();
```

Function Proxies can intercept when a function is called, this is a lot less common

```ts
const func = (a: number, b: number) => {
  return a + b;
};

const funcProxy = functionProxyBuilder(func)
  .apply((target, thisArg, argArray) => {
    //we just return double the value of the function as a demo
    return target.apply(thisArg, argArray) * 2;
  })
  .build();
```

### Decorators

There are 8 functions that should help to make decorators easier to write.
For each decorator there is one with arguments and one without arguments.

Note: If you check the tests for examples, the editor might throw an error and I didn't discover why yet
It still works in the tests and everywhere. It just displays an error specifically in the test files.

```ts
const printClassName = createClassDecoratorWithoutArguments((target) => {
  console.log(target.name);
});

// the prefix passed as an argument after key is used as an argument for the decorator
// if you want an additional property you can just append it at the end of the callback
const printPropName = createPropertyDecorator((target, key, prefix: string) => {
  console.log(prefix + key);
});

const printMethoParamLength = createMethodDecoratorWithoutArguments(
  (target, key, descriptor) => {
    console.log(descriptor.value.length);
  }
);

const printParamIndex = createParameterDecoratorWithoutArguments(
  (target, key, index) => {
    console.log(`Parameter ${index} is required`);
  }
);

@printClassName
class Test {
  @printPropName("prop: ")
  prop: string;

  constructor() {
    this.prop = "hello";
  }

  @printMethoParamLength
  someMethod(@printParamIndex str: string) {}
}
```

all the parameters are typed correctly, and for decorators with Arguments, you can just add arguments by appending them with a type at the end of the required parameters of the arrow function. If you type them, they will be typesafe as well.

### FunctionContext

This is a helper to bind an object to a function as the "this" value.

```ts
const object = {
  value: "foo",
};

function getObject() {
  return object;
}

/*
 * The first argument is a function to fetch the object that should
 * By using the method the object is always up to date
 *
 * The second argument is the function that should be bound to the object
 * it's required to be a function since arrow functions don't have a "this" value
 */
const fn = contextualizeFunction(getObject, function () {
  console.log(this.value);
});
```

### Match

The match function is a neat utility that would substitute the switch operator.
By default it breaks after each statement and you can cascade if needed.
Also cases can return something and it's typesafe.
Each case also accepts a function, this makes it nice since you can leave the match empty and just
use function matchers for each case (substitues switch(true))

NOTES: If you cascade, the return value of the last case (or default)
is used. If the case handler doesn't return anything, it's undefined

```ts
const val = match(3)
  .case(3, ({ cascade }) => {
    console.log("three");
    return true;
  })
  .case(4, (_, val) => {
    console.log(4);
    return 9;
  })
  .case(
    (val) => val === 5,
    ({ cascade }) => {
      console.log("five");
      cascade();
      return "Hello";
    }
  )
  .default(() => {})();

console.log("Return Value", val); // => true
```

### Types

There are some, maybe or maybe not neat types that also come with this library:

- IntRange
  - IntRange allows to define custom integer only ranges with a min and max value.
    The main catch is that the min and max value are quite restricted by the TS type checker. (e.g. U16 0-65535, would already be to big)
  - Example
    ```ts
    type U8 = IntRange<0, 255>;
    ```
- U8
  - U8 is a type that is an alias for integers between 0 and 255, great for colors etc
- Condition
  - Condition with it's helper, checkCondition, is a helper for checking conditions passed as parameters (e.g. T|(value:T)=> boolean)
  - Example
    ```ts
    function foo<T extends number>(condition: Condition<T>) {
      return checkCondition(condition, 3);
    }
    foo((val) => val === 3); // => true
    foo((val) => val >= 3); // => true
    foo((val) => val < 0); // => false
    foo(3); // => true
    foo(4); // => false
    ```
- Param
  - Param with it's helper, resolveParam, is a helper for accepting passed parameters (() => T | T)
  - Example
    ```ts
    function foo<T extends number>(param: Param<T>) {
      return resolveParam(param);
    }
    foo(() => 3); // => 3
    foo(3); // => 3
    ```

##### Documentation for Guards and Error helpers will be added later since they might get dropped

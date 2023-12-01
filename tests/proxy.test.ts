import { objectProxiyBuilder, functionProxyBuilder } from "../src/proxy";

describe("testing proxy module", () => {
  it("Basic object proxy", () => {
    const setTrap = jest.fn();
    const getTrap = jest.fn();
    const object = {
      value: "Hello",
    };

    const objectProxy = objectProxiyBuilder(object)
      .get("value", (value) => {
        getTrap();
        return value + " World";
      })
      .set("value", (target, newVal) => {
        setTrap();
        target.value = newVal;
        return true;
      })
      .build();

    expect(objectProxy.value).toEqual("Hello World");
    expect(getTrap).toHaveBeenCalledTimes(1);
    expect(setTrap).toHaveBeenCalledTimes(0);

    objectProxy.value = "Hello World";
    expect(objectProxy.value).toEqual("Hello World World");
    expect(getTrap).toHaveBeenCalledTimes(2);
    expect(setTrap).toHaveBeenCalledTimes(1);
  });

  it("Object proxy with no traps", () => {
    const object = {
      value: "Hello",
    };

    const objectProxy = objectProxiyBuilder(object).build();

    expect(objectProxy.value).toEqual("Hello");
    objectProxy.value = "Hello World";
    expect(objectProxy.value).toEqual("Hello World");
  });

  it("Basic function proxy", () => {
    // FN example
    const func = (a: number, b: number) => {
      return a + b;
    };

    const funcProxy = functionProxyBuilder(func)
      .apply((target, thisArg, argArray) => {
        return target.apply(thisArg, argArray) * 2;
      })
      .build();

    expect(funcProxy(1, 2)).toEqual(6);
  });

  it("Function proxy with no traps", () => {
    const func = (a: number, b: number) => {
      return a + b;
    };

    const funcProxy = functionProxyBuilder(func).build();

    expect(funcProxy(1, 2)).toEqual(3);
  });
});

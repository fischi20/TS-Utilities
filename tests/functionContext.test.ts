import { contextualizeFunction } from "../src/functionContext";

describe("testing function context module", () => {
  it("Add context to function", () => {
    const f = (a: number, b: number) => {
      return a + b;
    };

    const context = {
      value: 1,
    };

    // using function is important in this since arrow functions accept no context
    const fWithContext = contextualizeFunction(context, function () {
      return this.value;
    });

    expect(fWithContext()).toEqual(1);
  });
});

import { resolveParam, checkCondition } from "../src/types";

describe("testing types module", () => {
  it("Param and resolution", () => {
    const val = 3;
    const val2 = () => 5;

    expect(resolveParam(val)).toEqual(3);
    expect(resolveParam(val2)).toEqual(5);
  });

  it("condition and resolution", () => {
    const val = 3;
    const val2 = (val: number) => val === 5;

    expect(checkCondition(val, 3)).toEqual(true);
    expect(checkCondition(val2, 5)).toEqual(true);
    expect(checkCondition(val, 2)).toEqual(false);
  });
});

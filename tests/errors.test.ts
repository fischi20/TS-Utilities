import { riseError, tryAsync } from "../src/errors";

describe("testing error module", () => {
  it("General throw new error", () => {
    expect(riseError).toThrow();
  });

  it("Throw error as part of exception", () => {
    expect(() => {
      let a = undefined || riseError("Value can't be undefined");
    }).toThrow();
  });

  it("TryAsync test", () => {
    expect(tryAsync(() => 1)).resolves.toEqual(1);
    expect(tryAsync(() => riseError("E"))).rejects.toBeDefined();
  });
});

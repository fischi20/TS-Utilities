import {
  createGuardConstructor,
  executeGuardEnv,
  riseValidationError,
  validateGuards,
} from "../src/guards";

describe("testing guards module", () => {
  it("Basic guard", () => {
    const integerGuard = createGuardConstructor((value: number) => {
      return Number.isInteger(value);
    });

    expect(integerGuard(3).validate()).toEqual(true);
    expect(integerGuard(3.2).validate()).toEqual(false);
  });

  it("Guard with error messages", () => {
    const integerGuard = createGuardConstructor((value: number) => {
      return (
        Number.isInteger(value) ||
        riseValidationError("Value is not an integer")
      );
    });

    expect(integerGuard(3).validateErr()).toEqual(undefined);
    expect(() => integerGuard(3.2).validateErr()).toThrow();
  });

  it("Guard with error messages and catch", () => {
    const integerGuard = createGuardConstructor((value: number) => {
      return (
        Number.isInteger(value) ||
        riseValidationError("Value is not an integer")
      );
    });

    expect(
      integerGuard(3).guardOrCatch(
        (val) => val,
        (err) => 0
      )
    ).toEqual(3);
    expect(
      integerGuard(3.2).guardOrCatch(
        (val) => val,
        (err) => err.message
      )
    ).toEqual("Value is not an integer");
  });

  it("Validate multiple Guards", () => {
    const integerGuard = createGuardConstructor((value: number) => {
      return (
        Number.isInteger(value) ||
        riseValidationError("Value is not an integer")
      );
    });

    const positiveGuard = createGuardConstructor((value: number) => {
      return value > 0 || riseValidationError("Value is not positive");
    });

    const positive = positiveGuard(3);
    const integer = integerGuard(13);

    const [pos, int] = validateGuards(positive, integer);

    expect(pos).toEqual(3);
    expect(int).toEqual(13);

    const posErr = positiveGuard(-3);
    const intErr = integerGuard(3.2);
    expect(() => validateGuards(posErr, intErr)).toThrow();
  });

  it("Guard environment", () => {
    const integerGuard = createGuardConstructor((value: number) => {
      return (
        Number.isInteger(value) ||
        riseValidationError("Value is not an integer")
      );
    });

    const positiveGuard = createGuardConstructor((value: number) => {
      return value > 0 || riseValidationError("Value is not positive");
    });

    const positive = positiveGuard(3);
    const integer = integerGuard(13);

    const [pos, int] = validateGuards(positive, integer);

    expect(pos).toEqual(3);
    expect(int).toEqual(13);

    const posErr = positiveGuard(-3);
    const intErr = integerGuard(3.2);

    expect(() =>
      executeGuardEnv(
        () => {
          const [pos, int] = validateGuards(positive, integer);
          const [posE, intE] = validateGuards(posErr, intErr);
        },
        { forwardError: true }
      )
    ).toThrow();

    expect(
      executeGuardEnv(() => {
        const [pos, int] = validateGuards(positive, integer);
        const [posE, intE] = validateGuards(posErr, intErr);
      })
    ).toEqual(undefined);
  });
});

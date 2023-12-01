import { match } from "../src/match";

describe("testing match module", () => {
  it("basic match case", () => {
    // adding varargs to cases could be intresting
    const inputs = [1, 2, 3, 4];
    const outputs = [2, 4, 6, 6];

    inputs.forEach((input, index) => {
      expect(outputs[index]).toEqual(
        match(input)
          .case(1, (_, value) => {
            return value * 2;
          })
          .case(3, (_, value) => {
            return value * 2;
          })
          .case(2, (_, value) => {
            return value + 2;
          })
          .case(4, (_, value) => {
            return value + 2;
          })()
      );
    });
  });

  it("match case with default case", () => {
    const inputs = [1, 2, 3, 4, 5];
    const result = (value: number) => (value === 2 || value === 3 ? value : 0);
    inputs.forEach((input) => {
      expect(result(input)).toEqual(
        match(input)
          .case(2, (_, value) => value)
          .case(3, (_, value) => value)
          .default(() => 0)()
      );
    });
  });

  it("match case with multiple cases per handler", () => {
    const inputs = [1, 2, 3, 4];
    const outputs = [2, 4, 6, 6];

    inputs.forEach((input, index) => {
      expect(outputs[index]).toEqual(
        match(input)
          .case(1, 3, (_, value) => {
            return value * 2;
          })
          .case(2, 4, (_, value) => {
            return value + 2;
          })()
      );
    });
  });

  it("match case with function as case condition", () => {
    const inputs = [1, 2, 3, 4];
    const outputs = [2, 4, 6, 6];

    inputs.forEach((input, index) => {
      expect(outputs[index]).toEqual(
        match(input)
          .case(
            (value) => value % 2 !== 0,
            (_, value) => {
              return value * 2;
            }
          )
          .case(
            (value) => value % 2 === 0,
            (_, value) => {
              return value + 2;
            }
          )()
      );
    });
  });

  it("match case with cascading", () => {
    const inputs = [1, 2, 3, 4];

    const fn = jest.fn();

    inputs.forEach((input) => {
      match(input)
        .case(1, ({ cascade }, value) => {
          fn("1");
          cascade();
        })
        .case(2, ({ cascade }, value) => {
          fn("2");
          cascade();
        })
        .case(3, ({ cascade }, value) => {
          fn("3");
          cascade();
        })
        .case(4, ({ cascade }, value) => {
          fn("4");
        })();
    });

    inputs.forEach((input) => {
      match(input)
        .case(1, () => {
          fn("1");
        })
        .case(2, () => {
          fn("2");
        })
        .case(3, ({ cascade }) => {
          fn("3");
          cascade();
        })
        .case(4, () => {
          fn("4");
        })
        .default(() => {
          fn("default");
        })();
    });

    expect(fn).toHaveBeenCalledTimes(16);
  });
});

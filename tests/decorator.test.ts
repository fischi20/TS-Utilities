// If the editor displays errors in this file, don't worry, it's a weird behaviour
// I couldn't figure out yet, but if you run the tests they work fine, which is
// why this comment is here to begin with
// I will eventually look into it tho
// If you try and use it in a generic TS file not in a jest environment it will not throw an error
// in the editor either
//FIXME decorator param errors in jest env

import {
  createMethodDecoratorWithoutArguments,
  createMethodDecorator,
  createClassDecorator,
  createClassDecoratorWithoutArguments,
  createPropertyDecorator,
  createPropertyDecoratorWithoutArguments,
  createParameterDecorator,
  createParameterDecoratorWithoutArguments,
} from "../src/decorators";

describe("testing Method decorators", () => {
  it("create Method decorator wihout arguments", () => {
    const printMethodParamLength = createMethodDecoratorWithoutArguments(
      (target, key, descriptor) => {
        expect(descriptor.value.length).toEqual(1);
        expect(key).toEqual("someMethod");
      }
    );

    class Test {
      @printMethodParamLength
      someMethod(str: string) {}
    }
  });

  it("create Method decorator", () => {
    const printMethodInfoWithProp = createMethodDecorator(
      (target, key, descriptor: PropertyDescriptor, msg: string) => {
        expect(descriptor.value.length).toEqual(1);
        expect(msg).toEqual("Hello");
        expect(key).toEqual("someMethod");
      }
    );

    class Test {
      @printMethodInfoWithProp("Hello")
      someMethod(str: string) {}
    }
  });
});

describe("testing Class decorators", () => {
  it("create Class decorator without arguments", () => {
    const printClassName = createClassDecoratorWithoutArguments((target) => {
      expect(target.name).toEqual("Test");
    });

    @printClassName
    class Test {}
  });

  it("create Class decorator", () => {
    const printClassNameWithProp = createClassDecorator(
      (target, msg: string) => {
        expect(target.name).toEqual("Test");
        expect(msg).toEqual("Hello");
      }
    );

    @printClassNameWithProp("Hello")
    class Test {}
  });
});

describe("testing Property decorators", () => {
  it("create Property decorator without arguments", () => {
    const printPropertyName = createPropertyDecoratorWithoutArguments(
      (target, key) => {
        expect(key).toEqual("someProperty");
      }
    );

    class Test {
      @printPropertyName
      someProperty: string = "Hello";
    }
  });

  it("create Property decorator", () => {
    const printPropertyNameWithProp = createPropertyDecorator(
      (target, key, msg: string) => {
        expect(key).toEqual("someProperty");
        expect(msg).toEqual("Hello");
      }
    );

    class Test {
      @printPropertyNameWithProp("Hello")
      someProperty: string = "Hello";
    }
  });
});

describe(" Testing Parameter decorators", () => {
  it("create Parameter decorator without arguments", () => {
    const printParameterName = createParameterDecoratorWithoutArguments(
      (target, key, index) => {
        expect(key).toEqual("someMethod");
        expect(index).toEqual(0);
      }
    );

    class Test {
      someMethod(@printParameterName str: string) {}
    }
  });

  it("create Parameter decorator", () => {
    const printParameterNameWithProp = createParameterDecorator(
      (target, key, index, msg: string) => {
        expect(key).toEqual("someMethod");
        expect(index).toEqual(0);
        expect(msg).toEqual("Hello");
      }
    );

    class Test {
      someMethod(@printParameterNameWithProp("Hello") str: string) {}
    }
  });
});

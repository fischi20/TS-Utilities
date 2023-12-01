/* EXAMPLE USAGE

const passwordGuard = createGuardConstructor<string>((val) => {
  !!val || riseValidationError("Password cannot be empty");
  // check for min length
  val.length >= 8 ||
    riseValidationError(
      `Password must be at least 8 chars, current length: ${val.length}`
    );
  // check for number in password
  /\d/.test(val) || riseValidationError("Password must contain a number");
  // check for special char in password
  /\W/.test(val) || riseValidationError("Password must contain a special char");
  // check for upper case
  /[A-Z]/.test(val) ||
    riseValidationError("Password must contain an upper case letter");
  // check for lower case
  /[a-z]/.test(val) ||
    riseValidationError("Password must contain a lower case letter");
  return true;
});
type passwordGuard = typeof passwordGuard.infer;

const password = "Abcdg1!";

const pw2 = executeGuardEnv(
  () => {
    const [pw, pw2] = validateGuards(
      passwordGuard(password),
      passwordGuard(password)
    );
    return pw2;
  },
  { forwardError: true }
);
*/

export type GuardEnvOptions = {
  forwardError?: boolean;
  stderr?: boolean; // plain console.log the error
  onValidationError?: (error: ValidationError | ValidationGroupError) => void; // usefull for redirection to a logger
  catchAnyError?: boolean; // catch any error and return undefined
  onError?: (error: unknown) => void; // usefull for handling any error
};

export class Guard<T> {
  constructor(private validator: (val: T) => boolean, private value?: T) {}

  guard<R>(cb: (val: T) => R) {
    this.validate() || riseValidationError("validation incorrect"); //TODO replace with better error messages

    return cb(this.value!);
  }

  guardOrCatch<R, CR>(cb: (val: T) => R, err: (err: ValidationError) => CR) {
    try {
      if (this.validate()) return cb(this.value!);
      else return err(new ValidationError("validation incorrect")); //TODO replace with better error messages
    } catch (e) {
      if (e instanceof ValidationError) return err(e);
      else
        throw new Error(
          "Unexpected error, validations for guards should only throw ValidationError"
        );
    }
  }

  validate() {
    return this.value !== undefined && this.validator(this.value!);
  }

  validateErr() {
    this.validate() || riseValidationError("validation incorrect"); //TODO replace with better error messages
  }

  getValue() {
    return this.value;
  }

  setValue(val: T) {
    //TODO validate val??
    this.value = val;
  }

  setValidator(validator: (val: T) => boolean) {
    this.validator = validator;
  }

  toString() {
    return this.value?.toString();
  }
}

export function createGuardConstructor<T>(validator: (val: T) => boolean) {
  let creator = Object.assign(
    function (val: T) {
      return new Guard(validator, val);
    },
    { infer: new Guard<T>(() => true) }
  );

  return creator;
}

export function validateGuards<P extends Guard<any>[]>(
  ...guards: [...P]
): { [K in keyof P]: P[K] extends Guard<infer U> ? U : never } {
  const errors: ValidationError[] = [];
  const errorIndexes: number[] = [];
  const values: any[] = [];
  guards.forEach((guard, index) => {
    try {
      guard.validateErr();
      values.push(guard.getValue());
    } catch (e) {
      if (e instanceof ValidationError) {
        if (!e.name) {
          e.name = `${index + 1}. Guard argument error`;
        }
        errorIndexes.push(index + 1);
        errors.push(e);
      } else
        throw new Error(
          "Unexpected error, validations for guards should only throw ValidationError"
        );
    }
  });
  errors.length > 0 &&
    riseGroupValidationError(
      errors,
      `Validation index on the following arguments: ${errorIndexes}`
    ); //TODO replace with group guard error

  return values as any;
}

class ValidationError extends Error {
  // This is the error that is thrown when the validation of a guard fails
  constructor(message?: string, name?: string) {
    super(message);
    // remove FW stack from the error stack
    this.stack = "";
    this.name = name || "";
  }
}

class ValidationGroupError extends Error {
  // This is the error that is thrown when the validation of a group of guards fails
  constructor(public errors: ValidationError[], message?: string) {
    super(message);
    // remove FW stack from the error stack
    this.stack = removeGuardStackEntry(this.stack);
  }

  to_string() {
    const errorClone = new ValidationGroupError(this.errors, this.message);
    errorClone.stack = this.stack;
    const path = errorPath(errorClone.stack);
    errorClone.stack = "";
    let errorString = "";
    errorString += `Error at: ${path}\n Validation Error \n\n`;
    errorString += `Validation errors: [\n`;
    errorString += errorClone.errors
      .map((e) => `\t[${e.name}]: ${e.message}`)
      .join("\n")
      .concat("\n");
    errorString += `]`;
    return errorString;
  }
}

function removeGuardStackEntry(stack?: string) {
  const stackArr = stack?.split("\n");
  let lastGuardEntryIndex = stackArr?.findIndex((line) =>
    line.includes("riseGroupValidationError")
  );
  if (lastGuardEntryIndex) {
    lastGuardEntryIndex++;
    stackArr?.splice(1, lastGuardEntryIndex);
  }
  return stackArr?.join("\n");
}

export function riseValidationError(msg: string, name?: string): never {
  throw new ValidationError(msg, name);
}

function riseGroupValidationError(
  errors: ValidationError[],
  message?: string
): never {
  throw new ValidationGroupError(errors, message);
}

function errorPath(stack?: string) {
  const pathLine = stack?.split("\n")[1];
  const path = pathLine?.split("at ")[1];
  return path;
}

export function executeGuardEnv<R>(cb: () => R, options?: GuardEnvOptions) {
  const defaultOptions: GuardEnvOptions = {
    forwardError: false,
    stderr: true,
    catchAnyError: false,
  };
  options = Object.assign(defaultOptions, options);
  console.log(options);

  try {
    return cb();
  } catch (e) {
    if (e instanceof ValidationError) {
      options.stderr && console.error(e);
      options.onValidationError?.call({}, e);
      if (options.forwardError) throw e;
    } else if (e instanceof ValidationGroupError) {
      options.stderr && console.error(e.to_string());
      options.onValidationError?.call({}, e);
      if (options.forwardError) throw e;
    } else {
      if (!options.catchAnyError) throw e;
      else options.onError?.call({}, e);
    }
  }
}

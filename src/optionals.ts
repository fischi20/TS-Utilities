import { inspect } from "util"
import { Condition, ConditionFunction, Param, ParamFn, checkCondition, resolveParam } from "./types"

export enum OptionType {
    Some,
    None
}

export enum ResultType {
    Ok,
    Err
}

// create a type that checks if a type is a tuple, and if it is, returns the type of the 2. element
// otherwise returns the type itself
// how to check if a type is undefined or not?
// you can check if a type is undefined by using the `extends` keyword
export type Unzip<T> = T extends [infer A, infer B] ? [Option<A>, Option<B>] : [Option<T>, Option<never>];

type MapFn<T, M> = (value: T) => M

// Option

export class Option<T> {
    private state: OptionType = OptionType.None
    private value?: T

    constructor(val?: T) {
        if (arguments.length > 0) {
            this.state = OptionType.Some
            this.value = val
        }
    }

    isSome() {
        return this.state === OptionType.Some
    }

    isNone() {
        return !this.isSome()
    }

    isSomeAnd(fn: ConditionFunction<T>) {
        return this.isSome() && checkCondition(fn, this.value!)
    }

    expect(message: string) {
        if (this.isNone())
            throw new Error(message)
        return this.value!
    }

    expectOr(param: Param<T>) {
        return this.value || resolveParam(param);
    }

    inspect(cb: (value: T) => void) {
        if (this.isSome()) {
            cb(this.value!)
        }
    }

    map<M>(fn: MapFn<T, M>) {
        if (this.isNone()) return none<M>()

        return some(fn(this.value!))
    }

    mapOr<M>(fn: MapFn<T, M>, orValue: Param<M>) {
        return this.map(fn).expectOr(orValue)
    }

    ok_or<E>(error: Param<E>) {
        if (this.isNone()) return err<E, T>(error)
        return ok<T>(this.value!)
    }

    and<O>(option: Option<O>) {
        if (this.isNone()) return this
        return option
    }

    andThen<M>(fn: MapFn<T, Option<M>>) {
        return this.map(fn).expectOr(none<M>())
    }

    filter(predicate: ConditionFunction<T>) {
        if (this.isNone()) return this
        return checkCondition(predicate, this.value!) ? this : none<T>()
    }

    or<O>(option: Option<O>) {
        if (this.isSome()) return this
        return option
    }

    orElse<M>(fn: ParamFn<Option<M>>) {
        if (this.isSome()) return this
        return fn()
    }

    xor<O>(option: Option<O>) {
        if (this.isSome() && option.isNone()) return this
        if (this.isNone() && option.isSome()) return option
        return none<T>()
    }

    insert(value: Param<T>) {
        let val = resolveParam(value)
        this.state = OptionType.Some
        this.value = val
        return val;
    }

    getOrInsert(value: Param<T>) {
        if (this.isSome()) return this.value!
        return this.insert(value)
    }

    take() {
        let option
        if (this.isSome()) {
            option = some(this.value!)
            this.state = OptionType.None
            this.value = undefined
        } else {
            option = none<T>()
        }

        return option
    }

    takeIf(predicate: ConditionFunction<T>) {
        if (this.isNone()) return this
        return checkCondition(predicate, this.value!) ? this.take() : none<T>()
    }

    replace(value: Param<T>) {
        if (this.isNone()) return this.insert(value)
        let val = resolveParam(value)
        let old = this.value!
        this.value = val
        return old
    }

    zip<O>(other: Option<O>) {
        if (this.isNone() || other.isNone()) return none<[T, O]>()
        return some([this.value!, other.value!])
    }

    zipWith<O, M>(other: Option<O>, fn: (a: T, b: O) => M) {
        return this.zip(other).map(([a, b]) => fn(a, b))
    }


    unzip(): Unzip<T> {
        if (this.isNone()) return [none(), none()] as any
        
        if (this.value instanceof Array) {
            const [first, ...rest] = this.value
            return [some(first), some(rest)] as any
        }

        return [some(this.value!), none()] as any
    }
}

export function some<T>(value: Param<T>) {
    return new Option(resolveParam(value))
}

export function none<T>() {
    return new Option<T>
}

type Ok<T> = { ok: T }
type Err<E> = { err: E }
type ResultConstructor<T, E> = Ok<T> | Err<E>

// Result
/**
 * Result<Value, Error>
 */
export class Result<V, E> {
    private state: ResultType = ResultType.Err
    private value: V | E

    constructor(value: ResultConstructor<Param<V>, Param<E>>) {
        if ("ok" in value) {
            this.state = ResultType.Ok
            this.value = resolveParam(value.ok);
        } else {
            this.value = resolveParam(value.err)
        }
    }

    isOk() {
        return this.state === ResultType.Ok
    }

    isErr() {
        return !this.isOk()
    }

    isOkAnd(fn: ConditionFunction<V>) {
        return this.isOk() && checkCondition(fn, this.value as V)
    }

    isErrAnd(fn: ConditionFunction<E>) {
        return this.isErr() && checkCondition(fn, this.value as E)
    }

    ok() {
        if (this.isOk()) {
            return some(this.value as V)
        }
        return none<V>()
    }

    err() {
        if (this.isErr()) {
            return some(this.value as E)
        }
        return none<E>()
    }

    map<M>(fn: MapFn<V, M>): Result<M, E> {
        if (this.isErr()) return err<E>(this.value as E)
        return ok(fn(this.value as V))
    }

    mapOr<M>(fn: MapFn<V, M>, orValue: Param<M>): M {
        return this.map(fn).ok().expectOr(orValue)
    }

    mapErr<M>(fn: MapFn<E, M>): Result<V, M> {
        if (this.isOk()) return ok<V>(this.value as V)
        return err(fn(this.value as E))
    }

    inspect(cb: (value: V) => void) {
        if (this.isOk()) {
            cb(this.value as V)
        }
    }

    inspectErr(cb: (value: E) => void) {
        if (this.isErr()) {
            cb(this.value as E)
        }
    }

    expect(message: string) {
        if (this.isErr())
            throw new Error(message)
        return this.value as V
    }

    expectOr(param: Param<V>) {
        return this.ok().expectOr(param)
    }

    expectErr(message: string) {
        if (this.isOk())
            throw new Error(message)
        return this.value as E
    }

    and(result: Result<V, E>) {
        if (this.isErr()) return this
        return result
    }

    andThen<M>(fn: MapFn<V, Result<M, E>>): Result<M, E> {
        return this.map(fn).ok().expectOr(err<E>(this.value as E))
    }

    or(result: Result<V, E>) {
        if (this.isOk()) return this
        return result
    }

    orElse<M>(fn: MapFn<E, Result<V, M>>): Result<V, M> {
        return this.mapErr(fn).err().expectOr(ok<V>(this.value as V))
    }
}

export function ok<T, E = never>(value: Param<T>) {
    return new Result<T, E>({ ok: resolveParam(value) })
}

export function err<T, V = never>(value: Param<T>) {
    return new Result<V, T>({ err: resolveParam(value) })
}

const val = some(1).zip(some(true)).zip(some("hello"))
let val2 = val.unzip()[0].unzip()
let test = some([1,2,3]).unzip()
console.log(test);
console.log(val2);
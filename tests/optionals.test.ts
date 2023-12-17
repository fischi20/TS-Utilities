import { ok, err, some, none } from '../src/optionals'



describe('Optional Testing', () => {
    beforeEach(() => {
        opt = some(3)
        opt2 = none<number>()
    })

    let opt = some(3)
    let opt2 = none<number>()

    it('create an optional', () => {
        expect(opt).toEqual(some(3))
    })

    it('check if optional is some', () => {
        expect(opt.isSome()).toEqual(true)
    })

    it('check if optional is none', () => {
        expect(opt2.isNone()).toEqual(true)
    })

    it('some and', () => {
        let success_count = 0;

        opt.isSomeAnd((value) => {
            success_count++
            return true
        })

        opt2.isSomeAnd((value) => {
            success_count++
            return true
        })

        expect(success_count).toEqual(1)
    })

    it('expect', () => {
        const opt = some(3)
        expect(opt.expect('error')).toEqual(3)

        const opt2 = none<number>()
        expect(() => { opt2.expect('Error') }).toThrow()
    })

    it('expectOr', ()=> {
        const opt = some(3)
        expect(opt.expectOr(0)).toEqual(3)

        const opt2 = none<number>()
        expect(opt2.expectOr(0)).toEqual(0)
    })

    it('inspect', () => {
        let success_count = 0;
        const opt = some(3)
        const opt2 = none<number>()

        const cb = (value:number) => {
            success_count++
        }

        opt.inspect(cb)

        opt2.inspect(cb)

        expect(success_count).toEqual(1)
    })

    it('map', () => {
        expect(opt.map((value) => value + 1)).toEqual(some(4))
        expect(opt2.map((value) => value + 1)).toEqual(none<number>())
    })

    it('mapOr', () => {
        expect(opt.mapOr((value) => value + 1, 0)).toEqual(4)
        expect(opt2.mapOr((value) => value + 1, 10)).toEqual(10)
    })

    it('ok_or', () => {
        expect(opt.ok_or('error')).toEqual(ok(3))
        expect(opt2.ok_or('error')).toEqual(err('error'))
    })

    it('and', () => {
        expect(opt.and(opt2).and(some(4)).expectOr(22)).toEqual(22)
    })

    it('andThen', () => {
        expect(opt.andThen((value) => some(value + 1)).expectOr(0)).toEqual(4)
        expect(opt2.andThen((value) => some(value + 1)).expectOr(0)).toEqual(0)
    })

    it('or', () => {
        expect(opt.or(opt2).expectOr(0)).toEqual(3)
        expect(opt2.or(opt).expectOr(0)).toEqual(3)
    })

    it('orElse', () => {
        expect(opt.orElse(() => some(10)).expectOr(0)).toEqual(3)
        expect(opt2.orElse(() => some(10)).expectOr(0)).toEqual(10)
    })

    it('xor', () => {
        expect(opt.xor(opt2).expectOr(0)).toEqual(3)
        expect(opt2.xor(opt).expectOr(0)).toEqual(3)
        expect(opt.xor(opt).expectOr(0)).toEqual(0)
        expect(opt2.xor(opt2).expectOr(0)).toEqual(0)
    })

    it('filter', () => {
        expect(opt.filter((value) => value > 2).expectOr(0)).toEqual(3)
        expect(opt.filter((value) => value > 3).expectOr(0)).toEqual(0)
        expect(opt2.filter((value) => value > 3).expectOr(0)).toEqual(0)
    })

    it('insert', () => {
        expect(opt.insert(4)).toEqual(4)
        expect(opt2.insert(4)).toEqual(4)
    })

    it('getOrInsert', () => {
        expect(opt.getOrInsert(4)).toEqual(3)
        expect(opt2.getOrInsert(4)).toEqual(4)
    })

    it('take', () => {
        expect(opt.take()).toEqual(some(3))
        expect(opt2.take()).toEqual(none())

        expect(opt.take()).toEqual(none())
        expect(opt2.take()).toEqual(none())
    })

    it('takeIf', () => {
        const opt3 = some(3)
        expect(opt.takeIf((value) => value > 2)).toEqual(some(3))
        expect(opt2.takeIf((value) => value > 3)).toEqual(none())
        expect(opt3.takeIf((value) => value > 3)).toEqual(none())

        expect(opt.expectOr(0)).toEqual(0)
        expect(opt2.expectOr(0)).toEqual(0)
        expect(opt3.expectOr(0)).toEqual(3)
    })

    it('replace', () => {
        opt.replace(4)
        opt2.replace(4)
        expect(opt.expectOr(0)).toEqual(4)
        expect(opt2.expectOr(0)).toEqual(4)
    })

    it('zip', () => {
        expect(opt.zip(opt2)).toEqual(none())
        expect(opt2.zip(opt)).toEqual(none())
        expect(opt.zip(opt)).toEqual(some([3, 3]))
        expect(opt2.zip(opt2)).toEqual(none())
    })

    it('zipWith', () => {
        expect(opt.zipWith(opt2, (a, b) => a + b)).toEqual(none())
        expect(opt2.zipWith(opt, (a, b) => a + b)).toEqual(none())
        expect(opt.zipWith(opt, (a, b) => a + b)).toEqual(some(6))
        expect(opt2.zipWith(opt2, (a, b) => a + b)).toEqual(none())
    })

    it('unzip', () => {
        let opt2 = some('hello')
        let opt3 = some(true)
        let zipped = opt.zip(opt2)
        let zipped2 = zipped.zip(opt3)

        expect(zipped.unzip()).toEqual([some(3), some('hello')])
        expect(zipped2.unzip()).toEqual([some([3, 'hello']), some(true)])
        expect(none().unzip()).toEqual([none(), none()])
        expect(opt.unzip()).toEqual([some(3), none()])
        expect(some([1,2,3,4,5]).unzip()).toEqual([some([1,2,3,4]), some(5)])
    })
})

describe('Result Testing', () => {
    it('create a result', () => {
        expect(ok(3)).toEqual(ok(3))
        expect(err('error')).toEqual(err('error'))
    })

    it('is ok', () => {
        expect(ok(3).isOk()).toEqual(true)
        expect(err('error').isOk()).toEqual(false)
    })
    
    it('is err', () => {
        expect(ok(3).isErr()).toEqual(false)
        expect(err('error').isErr()).toEqual(true)
    })

    it('expect ok', () => {
        expect(ok(3).expect('error')).toEqual(3)
        expect(() => err('error').expect('error')).toThrow()
    })

    it('expect err', () => {
        expect(() => ok(3).expectErr('error')).toThrow()
        expect(err('error').expectErr('error')).toEqual('error')
    })

    it('ok', () => {
        expect(ok(3).ok()).toEqual(some(3))
        expect(err('error').ok()).toEqual(none())
    })

    it('err', () => {
        expect(ok(3).err()).toEqual(none())
        expect(err('error').err()).toEqual(some('error'))
    })

    it('map', () => {
        expect(ok(3).map((value) => value + 1)).toEqual(ok(4))
        expect(err('error').map((value) => ""+value)).toEqual(err('error'))
    })

    it('mapErr', () => {
        expect(ok(3).mapErr((value) => ""+value)).toEqual(ok(3))
        expect(err('error').mapErr((value) => value + 1)).toEqual(err('error1'))
    })

    it('mapOr', () => {
        expect(ok(3).mapOr((value) => value + 1, 0)).toEqual(4)
        expect(err('error').mapOr((value) => parseInt(""+value), 0)).toEqual(0)
    })

    it('inspect', () => {
        let success_count = 0;
        const cb = () => {
            success_count++
        }

        ok(3).inspect(cb)
        err('error').inspect(cb)

        expect(success_count).toEqual(1)
    })

    it('inspectErr', () => {
        let success_count = 0;
        const cb = () => {
            success_count++
        }

        ok(3).inspectErr(cb)
        err('error').inspectErr(cb)

        expect(success_count).toEqual(1)
    })

    it('expectOr', () => {
        expect(ok(3).expectOr(0)).toEqual(3)
        expect(err('error').expectOr(0)).toEqual(0)
    })

    it('and', () => {
        expect(ok(3).and(ok(4)).expectOr(0)).toEqual(4)
        expect(ok(3).and(err('error')).expectOr(0)).toEqual(0)
        expect(err('error').and(ok(4)).expectOr(0)).toEqual(0)
        expect(err('error').and(err('error')).expectOr(0)).toEqual(0)
    })

    it('andThen', () => {
        expect(ok(3).andThen((value) => ok(value + 1)).expectOr(0)).toEqual(4)
        expect(ok(3).andThen((value) => err('error')).expectOr(0)).toEqual(0)
        expect(err('error').andThen((value) => ok(4)).expectOr(0)).toEqual(0)
        expect(err('error').andThen((value) => err('error')).expectOr(0)).toEqual(0)
    })

    it('or', () => {
        expect(ok(3).or(ok(4)).expectOr(0)).toEqual(3)
        expect(ok(3).or(err('error')).expectOr(0)).toEqual(3)
        expect(err('error').or(ok(4)).expectOr(0)).toEqual(4)
        expect(err('error').or(err('error')).expectOr(0)).toEqual(0)
    })

    it('orElse', () => {
        expect(ok(3).orElse(() => ok(4)).expectOr(0)).toEqual(3)
        expect(ok(3).orElse(() => err('error')).expectOr(0)).toEqual(3)
        expect(err('error').orElse(() => ok(4)).expectOr(0)).toEqual(4)
        expect(err('error').orElse(() => err('error')).expectOr(0)).toEqual(0)
    })
})
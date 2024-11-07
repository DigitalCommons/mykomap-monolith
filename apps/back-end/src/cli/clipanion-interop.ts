import { ZodTypeAny } from "zod";

// Types borrowed from Typanion, so we can use Zod instead
namespace TypanionX {
  export type BoundCoercionFn = () => BoundCoercionFn;
  export type CoercionFn = (v: any) => BoundCoercionFn;
  export type Coercion = [string, BoundCoercionFn];

  export type LooseTest<U> = (value: U, test?: ValidationState) => boolean;
  export type StrictTest<U, V extends U> = (
    value: U,
    test?: ValidationState,
  ) => value is V;
  export type ValidationState = {
    p?: string;
    errors?: string[];
    coercions?: Coercion[];
    coercion?: CoercionFn;
  };
  export type Trait<Type> = { __trait: Type };
  export type LooseValidator<U, V> = LooseTest<U> & Trait<V>;
  export type StrictValidator<U, V extends U> = StrictTest<U, V> & Trait<V>;
  export function makeTrait<U>(value: U) {
    return <V>() => {
      return value as U & Trait<V>;
    };
  }

  export function makeValidator<U, V extends U>({
    test,
  }: {
    test: StrictTest<U, V>;
  }): StrictValidator<U, V>;
  export function makeValidator<U, V extends U = U>({
    test,
  }: {
    test: LooseTest<U>;
  }): LooseValidator<U, V>;
  export function makeValidator<U, V extends U>({
    test,
  }: {
    test: StrictTest<U, V> | LooseTest<U>;
  }) {
    return makeTrait(test)<V>();
  }
}

/** Convert a type validator into a Clipanion StrictValidator */
export function mkCheck<U, V extends U>(
  test: (v: U) => v is V,
): TypanionX.StrictValidator<U, V> {
  return TypanionX.makeValidator({ test });
}

/** Convert a Zod validator into a Clipanion StrictValidator */
export function zodCheck<V = string>(z: ZodTypeAny) {
  return mkCheck((v: unknown): v is V => z.safeParse(v).success);
}

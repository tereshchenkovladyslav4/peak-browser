type Keys<TUnion> =
  TUnion extends unknown ? keyof TUnion : never;

type Values<TObject extends Object> = {
  [TKey in keyof TObject]: TObject[TKey];
};

//

type RequiredKeys<TUnion> =
  keyof TUnion;

type RequiredValues<TUnion> =
  Pick<TUnion, RequiredKeys<TUnion>>;

//

type OptionalKeys<TUnion> =
  Exclude<Keys<TUnion>, RequiredKeys<TUnion>>;

type OptionalValue<TUnion, TKey extends PropertyKey> =
  TUnion extends Partial<Record<TKey, infer TValue>> ? TValue : never;

type OptionalValues<TUnion> = {
  [TOptionalKey in OptionalKeys<TUnion>]?: OptionalValue<TUnion, TOptionalKey>;
};

//

export type Merge<TUnion> = Values<
  RequiredValues<TUnion> &
  OptionalValues<TUnion>
>;

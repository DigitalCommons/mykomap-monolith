import { initClient, ClientInferResponseBody } from "@ts-rest/core";
import { contract } from "@mykomap/common";

const client = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL,
  baseHeaders: {},
});

export const {
  getConfig,
  getDatasetLocations,
  searchDataset,
  getDatasetItem,
  getVersion,
} = client;

export type Config = ClientInferResponseBody<typeof contract.getConfig, 200> & {
  languages: string[];
  ui: Dictionary<string | string[]> & {
    filterableFields: string[];
    directory_panel_field: string;
  };
};

// TODO: we can remove these types, once the full structure of the config JSON has been added to the
// ts-rest contract's Zod schema

// Maps any type K to a type V
//
// Elements are explicitly optional, courtesy of Partial
export type Assoc<K extends keyof any, V> = Partial<Record<K, V>>;

// Maps strings to a type V (which defaults to string)
//
// Elements are explicitly optional, courtesy of Partial
export type Dictionary<V = string> = Assoc<string, V>;

// Shared properties of all PropDefs.
export interface CommonPropDef {
  // Which property/field/header to initialise this property from.
  // If not set, defaults to the one with the same name.
  from?: string;

  // What to call this property in the UI.
  //
  // Should be an existing (possibly abbreviated) vocab URI - the
  // corresponding localised term will be used as the title.
  //
  // If undefined, the title defaults to the property's localised
  // vocab title (if the property *is* a vocab property). Otherwise, the
  // property ID is used verbatim, as a fallback. Note that a vocab
  // title is *not* a good choice if more than one property shares the
  // same vocab!
  titleUri?: string;

  // Defines the filtering on this property, if present. Can be set to one of:
  // - undefined: enable filter in UI, but don't pre-set it
  // - any other value: enable filter in UI and pre-set it to this
  //
  // This design attempts to leave the possibility open for filtering
  // non-vocab properties, even though that isn't currently
  // implemented. Which means it could be set to match any value (or
  // even an array of values). So to allow for that, we use
  // `undefined` to mean "enable the filter in the UI, but don't
  // preset it", so that we can use `true`, `false` and `null` to
  // match those values in the non-vocab case. Simply the presence of
  // this attribute is enough to enable filtering in the UI.
  //
  // In the case of a vocab property, a uri string should be used.
  //
  // In any case, setting a value which has no matches, or cannot
  // possibly have matches because it is not a valid value, will
  // result in the filter default being ineffective - as it it weren't
  // present. If it can be detected, there may be a warning.
  filter?: unknown;
}

// InnerDefs define value constraints, but not PropDef-related information.
// This is so that a MultiPropDef can wrap the value constrains without
// duplicating the PropDef information redundantly.
export type InnerDef = InnerValueDef | InnerVocabDef | InnerMultiDef;
export type InnerValueDef = {
  type: "value";
  as?: "string" | "boolean" | "number";
  strict?: boolean;
};
export type InnerVocabDef = {
  type: "vocab";
  uri: string;
};

export type InnerMultiDef = {
  type: "multi";
  of: InnerDef;
};

export type PropDef = ValuePropDef | VocabPropDef | MultiPropDef;
export type ValuePropDef = CommonPropDef & {
  type: "value";
  as?: "string" | "boolean" | "number";
  strict?: boolean;
};
export type VocabPropDef = CommonPropDef & {
  type: "vocab";
  uri: string;
};

export type MultiPropDef = CommonPropDef & {
  type: "multi";
  of: InnerDef;
};

export type PropDefs = Dictionary<PropDef>;

// A convenience variation of PropDefs used in ConfigData
export type ConfigPropDefs = Dictionary<PropDef | PropDef["type"]>;

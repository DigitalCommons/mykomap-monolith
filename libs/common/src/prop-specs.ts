import { Dictionary } from "./common-types.js";

/** Definitions of property specifiers, which can be instantiated as property
 * definitions.
 *
 * i.e. A PropSpec instance can be used to instantiate an equivalent PropDef
 * instance.  The former is an instance of interface, the latter a instance of a
 * class, which comes with some logic for computing things that the PropSpec
 * doesn't.
 */

/** This filter specifier for in PropSpecs */
export interface FilterSpec {
  /** Discriminator that needs to be present to distinguish empt
   * objects from a filter spec */
  preset: true;
  /** The value to preset the filter to. Should be a valid value for the property,
   * but if set to an invalid value, this is equivalent to no filter preset */
  to?: unknown;
}

/** Defines the shared properties of all PropSpecs. */
export interface CommonPropSpec {
  /** Which property/field/header to initialise this property from.
   *
   * Useful when importing from external data, e.g. CSVs.
   * If not set, defaults to the one with the same name.
   */
  from?: string;

  /** What to call this property in the UI.
   *
   * Should be an existing (possibly abbreviated) vocab URI - the
   * corresponding localised term will be used as the title.
   *
   * If undefined, the title defaults to the property's localised
   * vocab title (if the property *is* a vocab property). Otherwise, the
   * property ID is used verbatim, as a fallback. Note that a vocab
   * title is *not* a good choice if more than one property shares the
   * same vocab!
   */
  titleUri?: string;

  /** Defines the filtering on this property, if present. Can be set to one of:
   * - false or undefined: don't filter on this property
   * - true: enable filter in UI, but don't pre-set it
   * - a FilterSpec value: enable filter in UI and pre-set it to the value in `on`
   *
   * Aside: This design attempts to leave the possibility open for presetting
   * the filter for non-vocab properties, even though that isn't currently
   * implemented. These could contain an arbitrary value, and possibly an array
   * thereof. Which means we need to allow the preset to match any value (or
   * even an array of values). Therefore, to allow for that, we use the
   * FilterSpec interface to distinguish a simple directive to "filter this
   * property", from one with a preset, and which includes a `to` property that
   * can be anything it might be set to.
   *
   * In the case of a vocab property, a uri string or (equivalently) a qname
   * should be used. Althoug nin the latter case the prefix should be consistent
   * with those in the data.
   *
   * Setting a prefix with an `on` value which has no matches, or cannot
   * possibly have matches because it is not a valid value, will
   * result in the filter default being ineffective - as it it weren't
   * present. If it can be detected, there may be a warning.
   */
  filter?: FilterSpec | boolean;

  /** Enables or disables the text searching on this property, if present.
   */
  search?: boolean;
}

/** The part of a property specifier that is meaningfully inside a multiple.
 *
 * InnerSpecs define value constraints, but not PropSpec-related information.
 * This is so that a MultiPropSpec can wrap the value constrains without
 * duplicating the PropSpec information redundantly.
 */
export type InnerPropSpec = InnerValuePropSpec | InnerVocabPropSpec;

/** The shared part of ValueSpec and a MultiPropSpec of ValueSpecs */
export type InnerValuePropSpec = {
  /** The type specifier */
  type: "value";
  /** Optional indicator of how to interpret the text */
  as?: "string" | "boolean" | "number";
  /** Optional indicator of whether to allow nulls in interpretations */
  nullable?: boolean;
  /** Optional indicator of whether to be strict in interpretations */
  strict?: boolean;
};

/** The hared part of a VocabSpec and a MultiPropSpec of VocabSpecs */
export type InnerVocabPropSpec = {
  /** The type specifier */
  type: "vocab";
  /** The (abbreviated) vocab term URI */
  uri: string;
};

/** PropSpecs define properties of data items and how they map from raw objects */
export type PropSpec = ValuePropSpec | VocabPropSpec | MultiPropSpec;

/** A PropSpec representing a single (possibly absent) text value. */
export type ValuePropSpec = CommonPropSpec & InnerValuePropSpec;

/** A PropSpec representing a single (possibly absent) vocab URI. */
export type VocabPropSpec = CommonPropSpec & InnerVocabPropSpec;

/** A PropSpec representing zero or more InnerPropSpecs */
export type MultiPropSpec = CommonPropSpec & {
  type: "multi";
  of: InnerPropSpec;
};

/** The any of the possible PropSpec type specifiers */
export type PropSpecType = PropSpec["type"];

/** A collection of named PropSpecs. */
export type PropSpecs = Dictionary<PropSpec>;

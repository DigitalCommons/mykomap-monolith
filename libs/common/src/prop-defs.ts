/** Property definitions for defining a map item's properties dynamically.
 *
 * These are concrete classes implementing the relevant PropSpec interfaces.
 *
 */

import {
  CommonPropSpec,
  FilterSpec,
  InnerPropSpec,
  MultiPropSpec,
  PropSpec,
  PropSpecs,
  ValuePropSpec,
  VocabPropSpec,
} from "./prop-specs.js";

import { stringify } from "./utils.js";
import { schemas } from "./api/contract.js";
import { z } from "zod";

// Infer the types of various contract values....
export type VocabDef = z.infer<typeof schemas.VocabDef>;
export type I18nVocabDefs = z.infer<typeof schemas.I18nVocabDefs>;
export type VocabIndex = z.infer<typeof schemas.VocabIndex>;
export type Iso639Set1Code = z.infer<typeof schemas.Iso639Set1Code>;
export type NCName = z.infer<typeof schemas.NCName>;

/** The part of a property definition that is meaningfully inside a multiple */
export type InnerDef = VocabPropDef | ValuePropDef;

/** The top-level definition of a property definition. */
export type PropDef = VocabPropDef | ValuePropDef | MultiPropDef;

/** Used to create PropDefs from vocabs and PropSpecs */
export class PropDefsFactory {
  private readonly _vocabs: VocabIndex;
  private readonly lang: Iso639Set1Code;

  /** Constructor.
   *
   * @param vocabs - all the vocab definitions we will require to create VocabPropDefs.
   * @param lang - the language to create VocabPropDefs in by default.
   */
  constructor(vocabs: VocabIndex, lang: Iso639Set1Code) {
    this._vocabs = schemas.VocabIndex.parse(vocabs);
    this.lang = schemas.Iso639Set1Code.parse(lang);

    // Sanity check the languages are defined
    const invalidVocabIds: NCName[] = [];
    for (const vocabId in this._vocabs) {
      const vocab = this._vocabs[vocabId];
      if (lang in vocab) continue;

      invalidVocabIds.push(vocabId);
    }

    if (invalidVocabIds.length) {
      throw new Error(
        `PropDefServices initialised with these Vocabs which are incompatible ` +
          `with the target language '${lang}': ${invalidVocabIds}`,
      );
    }
  }

  /** Looks up an interationalised vocab given its URI */
  i18nVocab(uri: NCName): I18nVocabDefs {
    const abbrev = uri.replace(/:$/, ""); // Strip the trailing colon from this (assumed) abbrev URI
    const vocab = this._vocabs[abbrev];
    if (vocab == null) throw new Error(`unknown vocab URI: '${uri}'`);
    return vocab;
  }

  /** Looks up a localised vocab, given its URI and a language code */
  vocabDef(uri: NCName, lang: Iso639Set1Code): VocabDef {
    const i18nVocab = this.i18nVocab(uri);
    const vocab = i18nVocab[lang];
    if (vocab == null)
      throw new Error(
        `no terms defined for language code '${lang}' in vocab '${uri}'`,
      );
    return vocab;
  }

  /** Make a PropDef from a PropSpec
   *
   * @param def = the specification to use.
   * @returns a PropDef instance of the approriate type.
   */
  mkPropDef(def: ValuePropSpec): ValuePropDef;
  mkPropDef(def: VocabPropSpec): VocabPropDef;
  mkPropDef(def: MultiPropSpec): MultiPropDef;
  mkPropDef(def: InnerPropSpec): InnerDef;
  mkPropDef(def: PropSpec): PropDef;
  mkPropDef(def: PropSpec): PropDef {
    switch (def.type) {
      case "value":
        return new ValuePropDef(def);
      case "vocab":
        return new VocabPropDef(def, this.vocabDef(def.uri, this.lang));
      case "multi":
        // We can cast this safely as we know that InnerSpec -> InnerDef
        const of = this.mkPropDef(def.of);
        return new MultiPropDef({ ...def, of });
    }
  }

  /** Make a Record of indexed PropDefs from a Dictionary of ProfSpecs
   *
   *
   * @param specs - a Dictionary of PropSpecs.
   * @returns A record of PropDefs, indexed by the same keys as the
   * relevant PropSpec.
   *
   * A Dictionary may have undefined elements; a Record, by definition, doesn't.
   * This function should honour that, and guarantee none.
   */
  mkPropDefs(specs: PropSpecs): PropDefs {
    const result: Record<string, PropDef> = {};
    for (const propName in specs) {
      const propDef = specs[propName];
      if (propDef == undefined) continue;

      result[propName] = this.mkPropDef(propDef);
    }

    return result;
  }
}

/** The common parts of a PropDef.
 *
 */
export abstract class CommonPropDef implements CommonPropSpec {
  readonly from?: string;
  readonly titleUri?: string;
  readonly filter: FilterSpec | boolean;
  readonly search: boolean;

  /** Constructor.
   *
   * @param init - the specification to use
   */
  constructor(init: PropSpec) {
    this.from = init.from;
    this.titleUri = init.titleUri;
    this.filter = init.filter ?? false;
    this.search = !!init.search;
  }

  /** Get the text form of a value
   *
   * @returns a value depending on the type of PropDef. If it is a MultiPropDef,
   * an array of strings is returned (which may be empty). Otherwise a single
   * string will be, or an undefined value if the property is undefined.
   */
  abstract textForValue(value: unknown): string | string[] | undefined;

  /** @return true if and only if a filter should be created for this PropDef */
  isFiltered() {
    return !!this.filter;
  }
}

/** A PropDef representing a single (possibly absent) text value
 */
export class ValuePropDef extends CommonPropDef implements ValuePropSpec {
  /** The type specifier */
  readonly type = "value";

  /** Conversion hints */
  readonly as: ValuePropSpec["as"];
  readonly nullable: boolean;
  readonly strict: boolean;

  /** Constructor
   * @param init - the specification for the ValuePropDef
   */
  constructor(init: ValuePropSpec) {
    super(init);
    this.as = init.as;
    this.nullable = init.nullable === true;
    this.strict = init.strict === true;
  }

  override textForValue(value: unknown) {
    return value === undefined ? undefined : stringify(value);
  }
}

/** A PropDef representing a single (possibly absent) vocab URI
 */
export class VocabPropDef extends CommonPropDef implements VocabPropSpec {
  /** The type specifier */
  readonly type = "vocab";

  /** The (abbreviated) vocabulary URI */
  readonly uri: string;

  /** Constructor
   * @param init - the specification for the VocabPropDef
   * @param vocab - the localised vocab definitions to use
   */
  constructor(
    init: VocabPropSpec,
    readonly vocab: VocabDef,
  ) {
    super(init);
    this.uri = init.uri;
  }

  override textForValue(value: unknown) {
    if (typeof value === "string") return this.vocab.terms[value];
    return "";
  }
}

/** A PropDef representing zero or more single-valued PropDefs
 */
export class MultiPropDef extends CommonPropDef implements MultiPropSpec {
  readonly type = "multi";
  readonly of: InnerDef;

  /** This indicates the vocab URI in use if it contains vocab Qname. It is
   * undefined otherwise
   */
  readonly uri?: string;

  /** This indicates the vocab definition in use if it contains vocab values. It is
   * undefined otherwise
   */
  readonly vocab?: VocabDef;

  /** Constructor
   *
   * @param init - the specification for this MultiPropSpec. Note, we insist on
   * the of: parameter to be concrete so we can delegate getTextForProperty
   * calls to it.
   */
  constructor(init: Omit<MultiPropSpec, "of"> & { of: InnerDef }) {
    super(init);
    this.of = init.of;

    // Initialise the vocab if present
    if ("vocab" in init.of) this.vocab = init.of.vocab;
  }

  override textForValue(value: unknown) {
    if (value instanceof Array)
      return value.map((v) => stringify(this.of.textForValue(v)));
    return [];
  }
}

/** A collection of named PropDefs */
export type PropDefs = Record<string, PropDef>;

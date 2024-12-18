/** Property definitions for defining a map item's properties dynamically.
 *
 * These are concrete classes implementing the relevant PropSpec interfaces.
 *
 */
import { z } from "zod";

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

// Infer the types of various contract values....
export type VocabDef = z.infer<typeof schemas.VocabDef>;
export type I18nVocabDef = z.infer<typeof schemas.I18nVocabDef>;
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

  /** Constructor.
   *
   * @param vocabs - all the vocab definitions we will require to create VocabPropDefs.
   * @param checkLangs - if given, check that the vocabs include translations for these languages.
   */
  constructor(vocabs: VocabIndex, checkLangs?: Iso639Set1Code[]) {
    this._vocabs = schemas.VocabIndex.parse(vocabs);

    if (checkLangs) {
      // Sanity check the languages are defined for each vocab
      const invalidVocabIds: NCName[] = [];
      for (const vocabId in this._vocabs) {
        const vocab = this._vocabs[vocabId];
        if (checkLangs.every((lang) => lang in vocab)) continue;

        invalidVocabIds.push(vocabId);
      }

      if (invalidVocabIds.length) {
        throw new Error(
          `PropDefServices initialised with these Vocabs which are incompatible ` +
            `with the target languages '${checkLangs}': ${invalidVocabIds}`,
        );
      }
    }
  }

  /** Looks up an interationalised vocab given its URI */
  i18nVocabDef(uri: NCName): I18nVocabDef {
    const abbrev = uri.replace(/:$/, ""); // Strip the trailing colon from this (assumed) abbrev URI
    const vocab = this._vocabs[abbrev];
    if (vocab == null) throw new Error(`unknown vocab URI: '${uri}'`);
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
        return new VocabPropDef(def, this.i18nVocabDef(def.uri));
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
   * @param lang - the language code to use for the text translation, only relevant for vocab types.
   *
   * @returns a value depending on the type of PropDef. If it is a MultiPropDef,
   * an array of strings is returned (which may be empty). Otherwise a single
   * string will be, or an undefined value if the property is undefined.
   */
  abstract textForValue(
    value: unknown,
    lang?: Iso639Set1Code,
  ): string | string[] | undefined;

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
   * @param i18nVocab - the internationalised vocab definitions to use
   */
  constructor(
    init: VocabPropSpec,
    readonly i18nVocab: I18nVocabDef,
  ) {
    super(init);
    this.uri = init.uri;
  }

  /** Looks up a localised vocab, given a language code */
  localisedVocabDef(lang: Iso639Set1Code): VocabDef {
    const vocab = this.i18nVocab[lang];
    if (vocab == null)
      throw new Error(
        `no terms defined for language code '${lang}' in vocab '${this.uri}'`,
      );
    return vocab;
  }

  override textForValue(value: unknown, lang?: Iso639Set1Code) {
    if (lang === undefined)
      throw new Error(`no language code provided for vocab '${this.uri}'`);
    if (typeof value === "string")
      return this.localisedVocabDef(lang).terms[value];
    return "";
  }
}

/** A PropDef representing zero or more single-valued PropDefs
 */
export class MultiPropDef extends CommonPropDef implements MultiPropSpec {
  readonly type = "multi";
  readonly of: InnerDef;

  /**
   * This indicates the vocab URI in use if it contains vocab Qname. It is undefined otherwise
   */
  readonly uri?: string;

  /**
   * This indicates the internationalised vocab definition in use if it contains vocab values. It
   * is undefined otherwise.
   */
  readonly i18nVocab?: I18nVocabDef;

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
    if (init.of instanceof VocabPropDef) this.i18nVocab = init.of.i18nVocab;
  }

  override textForValue(value: unknown, lang?: Iso639Set1Code) {
    if (value instanceof Array)
      return value.map((v) => stringify(this.of.textForValue(v, lang)));
    return [];
  }
}

/** A collection of named PropDefs */
export type PropDefs = Record<string, PropDef>;

/** Code related to PropSets/PropDefs/DatasetItems and CSV */

import { z, ZodType, ZodTypeDef } from "zod";
import { Schema } from "udsv";
import { DatasetItem, PropParser, PropParserInfo } from "../dataset.js";
import { RowTransformer } from "../csv.js";
import {
  InnerValuePropSpec,
  MultiPropDef,
  PropDef,
  PropDefs,
  VocabDef,
  VocabPropSpec,
  boolify,
  numberify,
  splitField,
  stringify,
} from "@mykomap/common";

/** An error subclass to indicate validation errors */
export class ValidationError extends Error {
  constructor(...args: any[]) {
    super(...args);
  }
}

/** Check if a CSV field is considered "empty".
 *
 * This currently means:
 * - undefined
 * - null
 * - empty string, ""
 */
export function isEmpty(v: unknown): boolean {
  // Note the deliberate loose comparison with null - includes undefined.
  return v == null || v === "";
}

// Wrapper function for zod validations, converting ZodErrors to ValidationErrors
const validZ = <I, P extends ZodTypeDef, O, Z extends ZodType<O, P, I>>(
  z: Z,
  v: unknown,
): O => {
  const result = z.safeParse(v);
  if (result.success) return result.data;

  throw new ValidationError(`validation error`, { cause: result.error });
};

/** Type of values received by CSV PropParser */
export type CsvVal = string | null | undefined;

/** Type of values output from CSV PropParser */
export type SimpleVal = string | number | boolean | undefined | null;

/** Makes a PropDefParser for a CSV field given a PropDef
 *
 * Handles the `from`, `as`, `nullable` and `strict` fields, where appropriate
 */
export function mkCsvPropDefParser(propDef: PropDef) {
  // Construct these once at the start.
  const zString = z.string();
  const zNumber = z.number();
  const zBoolean = z.boolean();

  // Parsers for ValuePropSpec
  function parseValue(
    propSpec: InnerValuePropSpec,
  ): PropParser<CsvVal, SimpleVal> {
    switch (propSpec.nullable) {
      case true:
        // Nullable parsers.
        // Needed as we don't want (for instance) null lat/lng values to become
        // coerced into zeros.

        // Strict nullable - allow nulls but throw on anything which needs
        // coersion.
        if (propSpec.strict)
          switch (propSpec.as) {
            case "string":
              // preserve empty string special case
              return (v) => (isEmpty(v) ? v : validZ(zString, v));
            case "number":
              return (v) => (isEmpty(v) ? null : validZ(zNumber, v));
            case "boolean":
              return (v) => (isEmpty(v) ? null : validZ(zBoolean, v));
            default:
              return (v) => v;
          }

        // Sloppy nullable - coerces values to the right type if not null
        switch (propSpec.as) {
          case "string":
            // preserve empty string special case
            return (v) => (v === "" ? v : stringify(v, null));
          case "number":
            return (v) => (isEmpty(v) ? null : numberify(v, null));
          case "boolean":
            return (v) => (isEmpty(v) ? null : boolify(v, null));
          default:
            return (v) => v;
        }

      default:
      case false:
        switch (propSpec.strict) {
          case true:
            // Strict non-nullable parsers
            switch (propSpec.as) {
              case "string":
                return (v) => validZ(zString, v);
              case "number":
                return (v) => validZ(zNumber, v);
              case "boolean":
                return (v) => validZ(zBoolean, v);
              default:
                return (v) => v;
            }

          default:
          case false:
            // Unstrict non-nullable parsers.
            switch (propSpec.as) {
              case "string":
                return (v) => stringify(v, "");
              case "number":
                return (v) => numberify(v, 0);
              case "boolean":
                return (v) => boolify(v, false);
              default:
                return (v) => v;
            }
        }
    }
  }

  function parseVocab(
    propDef: VocabPropSpec,
    vocab: VocabDef,
  ): PropParser<CsvVal, string | undefined | null> {
    // FIXME add (non-)nullable and strict semantics later
    return (v: unknown) => {
      switch (typeof v) {
        case "string":
          if (v in vocab.terms) return v;

          // FIXME this case, an empty-string (so effectively undefined) vocab,
          // might not be allowed in some cases?
          // However no way to know with current spec, so just allow it.
          if (v === "") return null;

          throw new ValidationError(`Invalid ${propDef.uri} vocab URI: '${v}'`);

        default:
          // FIXME this case, an undefined/null vocab, might not be allowed in some cases?
          // However no way to know with current spec, so just allow it.
          if (v === null || v === undefined) return null;

          // Defined, but non-string vocabs are not valid.
          throw new ValidationError(`Invalid ${propDef.uri} vocab URI: '${v}'`);
      }
    };
  }

  function parseMulti(
    propDef: MultiPropDef,
    opts: { delim: string; escape: string },
  ): PropParser<CsvVal, SimpleVal[]> {
    // FIXME add (non-)nullable and strict semantics later
    return (v: unknown) => {
      switch (typeof v) {
        case "string":
          const innerDef = propDef.of;
          // split, but ignore empty values (always present in degenerate "" case)
          const values = splitField(v, opts).filter((v) => v != "");

          switch (innerDef.type) {
            case "value":
              return values.map(parseValue(innerDef));

            case "vocab":
              return values.map(parseVocab(innerDef, innerDef.vocab));
          }
          throw new Error(`unexpected code path!`); // Belt and braces

        default:
          // FIXME undefined multis might not be allowed in all cases?
          // However no way to know with current spec, and it seems
          // reasonable to interpret them as an empty list.
          if (v === null || v === undefined) return [];

          throw new ValidationError(`Invalid multi-value property: '${v}'`);
      }
    };
  }

  switch (propDef.type) {
    case "value":
      return parseValue(propDef);
    case "vocab":
      return parseVocab(propDef, propDef.vocab);
    case "multi":
      return parseMulti(propDef, { delim: ";", escape: "\\" });
  }
}

/** Constructs a constructor for a parser for transforming CSV rows into
 * DatasetItems
 *
 * The information for doing this arrives at different points, so it
 * has to be done step by step.
 * - First, we have the PropDefs
 * - Then we find out the CSV headers when the CSV is parsed.
 * - Finally we get a CSV row array and can parse that into a DatasetItem.
 */
export function mkCsvParserGenerator(propDefs: PropDefs) {
  const propParserInfos: Array<PropParserInfo<CsvVal, unknown>> = [];

  // Make sure that there is an ID property at the very least, as DatasetItems
  // must have that.
  const idProp = propDefs.id;
  if (idProp === undefined)
    throw new Error(`PropDefs must have the mandatory id property defined`);
  if (idProp.from === undefined)
    throw new Error(
      `PropDefs must have a CSV header defined for the mandatory id property`,
    );

  // Do as much as we can here - up to but not including the CSV column indexes.
  for (const key in propDefs) {
    const propDef = propDefs[key];

    propParserInfos.push({
      ix: -1,
      from: propDef.from,
      to: key,
      parser: mkCsvPropDefParser(propDef),
    });
  }

  // This is the RowTransformer constructor
  return (schema: Schema): RowTransformer<DatasetItem> => {
    const headers = schema.cols.map((col) => col.name);

    // Now look up the array correspondances using the headers.
    // Store them in the propParsers
    const missing: string[] = [];
    for (const pp of propParserInfos) {
      if (pp.from !== undefined) {
        const ix = headers.indexOf(pp.from);
        if (ix < 0) missing.push(pp.from);
        else pp.ix = ix;
      }
    }

    // If any headers are missing, that's an error
    if (missing.length)
      throw new ValidationError(
        `CSV has missing headers. Expected: ${JSON.stringify(missing)}`,
      );

    // Return a DatasetItem transformer
    return (row: string[]): DatasetItem => {
      const result: Omit<DatasetItem, "id"> = {};

      for (const ppi of propParserInfos) {
        try {
          result[ppi.to] = ppi.parser(row[ppi.ix]);
        } catch (e) {
          throw new ValidationError(
            `whilst parsing prop '${ppi.to}' from CSV field #${ppi.ix + 1}, ` +
              `'${ppi.from}': ${e instanceof Object && "cause" in e ? e.cause : e}`,
            { case: e },
          );
        }
      }

      return result as DatasetItem;
    };
  };
}

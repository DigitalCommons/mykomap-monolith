import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import * as Rx from "../rxdefs.js";
import RxUtils from "../rxutils.js";
import { Iso639Set1Codes } from "../iso639-1.js";

extendZodWithOpenApi(z);

const c = initContract();

/** Helper function to generate Zod refinements from a RegExp
 *
 * It promotes the RegExp to be a unicode, entire-string match, if it is
 * not already.
 *
 * It also sets the validation error message attribute from the message parameter.
 *
 * @returns a Zod validator generated by the Zod.string().refine() method
 */
function ZodRegex(rx: RegExp, message: string) {
  return z.string().refine((v: any) => RxUtils.uaon(rx).test(String(v)), {
    message,
  });
}

const Location = z.array(z.number()).min(2).max(2);
const DatasetId = z.string().regex(Rx.UrlSafeBase64);
const DatasetItem = z.object({}).passthrough();
const Dataset = z.array(Location);
const NCName = ZodRegex(Rx.NCName, "Invalid NCName format");
const QName = ZodRegex(Rx.QName, "Invalid QName format");
const DatasetItemId = ZodRegex(
  Rx.DatasetItemId,
  "Invalid DatasetItemId format",
);
const DatasetItemIx = ZodRegex(
  Rx.DatasetItemIx,
  "Invalid DatasetItemIx format",
);
const DatasetItemIdOrIx = ZodRegex(
  Rx.DatasetItemIdOrIx,
  "Invalid DatasetItemIdOrIx format",
);
// Developer note: PrefixUri is regex based, as it attempts to avoid the .url() deficiencies in
// https://github.com/colinhacks/zod/issues/2236. But also our concept of a URI is narrowed, see
// documentation for Rx.PrefixUri.
const PrefixUri = ZodRegex(Rx.PrefixUri, "Invalid prefix URI format");
const PrefixIndex = z.record(PrefixUri, NCName);
// Zod.enum needs some hand-holding to be happy with using object keys, as it wants a
// guaranteed non-zero length list
const [lang0, ...langs] = Object.keys(Iso639Set1Codes);
const Iso639Set1Code = z.enum([lang0, ...langs]);
const VocabDef = z.object({
  title: z.string(),
  terms: z.record(NCName, z.string()),
});
const I18nVocabDefs = z.record(Iso639Set1Code, VocabDef);
const VocabIndex = z.record(NCName, I18nVocabDefs);

// The following specs shoud match the types in prop-spec.ts
const FilterSpec = z.object({ preset: z.literal(true), to: z.unknown() });
const CommonPropSpec = z.object({
  from: z.string().optional(),
  titleUri: z.string().optional(),
  filter: z.union([FilterSpec, z.boolean()]).optional(),
  search: z.boolean().optional(),
});
const InnerValuePropSpec = z.object({
  type: z.literal("value"),
  as: z
    .union([z.literal("string"), z.literal("boolean"), z.literal("number")])
    .optional(),
  strict: z.boolean().optional(),
});
const InnerVocabPropSpec = z.object({
  type: z.literal("vocab"),
  uri: z.union([PrefixUri, QName]),
});
const InnerPropSpec = z.union([InnerValuePropSpec, InnerVocabPropSpec]);
const OuterMultiPropSpec = z.object({
  type: z.literal("multi"),
  of: InnerPropSpec,
});
const ValuePropSpec = CommonPropSpec.merge(InnerValuePropSpec);
const VocabPropSpec = CommonPropSpec.merge(InnerVocabPropSpec);
const MultiPropSpec = CommonPropSpec.merge(OuterMultiPropSpec);
const PropSpec = z.discriminatedUnion("type", [
  ValuePropSpec,
  VocabPropSpec,
  MultiPropSpec,
]);
const PropSpecs = z.record(z.string(), PropSpec);

const ConfigData = z.object({
  prefixes: PrefixIndex,
  vocabs: VocabIndex,
  itemProps: PropSpecs,
});
const VersionInfo = z.object({
  name: z.string(),
  buildTime: z.string().datetime({ offset: false }),
  version: z.array(z.number()),
  commitDesc: z.string(),
  nodeEnv: z.enum(["production", "development"]),
});
const ErrorInfo = z.object({ message: z.string() }).passthrough();

export const schemas = {
  Location,
  ConfigData,
  DatasetId,
  DatasetItemId,
  DatasetItemIdOrIx,
  DatasetItemIx,
  DatasetItem,
  Dataset,
  FilterSpec,
  I18nVocabDefs,
  Iso639Set1Code,
  MultiPropSpec,
  NCName,
  PrefixUri,
  PrefixIndex,
  PropSpec,
  PropSpecs,
  QName,
  ValuePropSpec,
  VersionInfo,
  VocabDef,
  VocabIndex,
  VocabPropSpec,
  ErrorInfo,
};

export const contract = c.router({
  getDatasetLocations: {
    method: "GET",
    path: "/dataset/:datasetId/locations",
    summary: "obtains a dataset's locations",
    description:
      "Obtains all the locations for a dataset by the dataset ID, which by passing in the appropriate options, might be in different formats",
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
    }),
    responses: {
      200: Dataset.openapi({
        // description: "the dataset matching the supplied ID",
      }),
      400: ErrorInfo.openapi({
        // description: "bad input parameter",
      }),
      404: ErrorInfo.openapi({
        // description: "no such dataset",
      }),
    },
  },
  searchDataset: {
    method: "GET",
    path: "/dataset/:datasetId/search",
    summary:
      "obtains a list of dataset entries satisfying the search criteria supplied",
    description:
      "Obtains an array of dataset item indexes, which match the search criteria supplied",
    query: z.object({
      text: z.string().optional().openapi({
        // description: "a text fragment to match",
      }),
      // Promote singular parameters to arrays (so that a single filter is possible!),
      // see https://github.com/ts-rest/ts-rest/issues/290#issuecomment-1658983510
      filter: z
        .array(QName)
        .or(QName.transform((v: string) => [v]))
        .optional()
        .openapi({
          // description: "uniquely specifies the taxonomy filter items wanted",
        }),
    }),
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
    }),
    responses: {
      200: z.array(DatasetItemIx).openapi({
        // description: "the dataset item indexes matching the supplied criteria",
      }),
      400: ErrorInfo.openapi({
        // description: "bad input parameter",
      }),
      404: ErrorInfo.openapi({
        // description: "no such dataset",
      }),
    },
  },
  getDatasetItem: {
    method: "GET",
    path: "/dataset/:datasetId/item/:datasetItemIdOrIx",
    summary: "obtains a dataset item by its unique ID",
    description:
      "Obtains a single dataset item by its ID or its index, and the dataset's ID.",
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
      datasetItemIdOrIx: DatasetItemId.openapi({
        // description: "uniquely specifies the dataset item wanted within the dataset",
      }),
    }),
    responses: {
      200: DatasetItem.openapi({
        // description: "the dataset item matching the supplied ID",
      }),
      400: ErrorInfo.openapi({
        // description: "bad input parameter",
      }),
      404: ErrorInfo.openapi({
        // description: "no such dataset or dataset item",
      }),
    },
  },
  getConfig: {
    method: "GET",
    path: "/dataset/:datasetId/config",
    summary: "obtain various configured parameters for a map",
    description:
      "Obtains configured parameters for a map, which amongst other things, " +
      "include default values for various options, and definitions of " +
      "vocabulary terms with their localised labels, that are used to " +
      "interpret identifers in the data and/or elsewhere.",
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
    }),
    responses: {
      200: ConfigData.openapi({
        // description: "variuos configured parameters for a map",
      }),
      400: ErrorInfo.openapi({
        // description: "bad input parameter",
      }),
      404: ErrorInfo.openapi({
        // description: "no such map",
      }),
    },
  },
  getVersion: {
    method: "GET",
    path: "/version",
    summary: "obtains Mykomap server version information",
    description:
      "Obtains version information about the backend Mykomap server, in the form of a JSON object",
    responses: {
      200: VersionInfo.openapi({
        // description: "information about the current Mykomap server version",
      }),
    },
  },
});

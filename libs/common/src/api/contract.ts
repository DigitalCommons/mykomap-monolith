import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

const c = initContract();

/** A regex testing for an *URL-safe* base64 string (RFC4648 sect 5) */
const UrlSafeBase64Rx = /^[A-Z0-9_-]+$/i;

/** A string regular expression matching an XML NCName
 *
 * - An NCName is an XML Name, but with no colons allowed.
 * - An XML Name is a complicated beast, but loosely a Unicode version of \w,
 *   or in other words, a unicode alphanumeric symbolic identifier.
 *   - It can contain digits, letters, hyphens, periods and underscores and
 *     certain unicode equivalents.
 *   - But it must not start with digits, a hyphen or a period, nor certain
 *     unicode equivalents.
 *
 * The regex for an XML Name is adapted from O'Reilly Regex Cookbook section 8.4,
 * "XML 1.0 names (approximate)" - but the colon is removed.
 *
 * Paraphrasing that book's explanation:
 * - the name start character can be a [:_] or
 * - any of the following Unicode categories:
 *   - Lowercase letter (Ll)
 *   - Uppercase letter (Lu)
 *   - Titlecase letter (Lt)
 *   - Letter without case (Lo)
 *   - Letter number (Nl)
 * - subsequent characters can also include [.-] or
 *   - Mark (M)
 *   - Modifier letter (Lm)
 *   - Decimal digit (Nd)
 *
 * This definition is not compiled, as it is intended for composition below.
 * Therefore it is wrapped in a non-capturing group to isolate it without affecting
 * the captures which may be defined around it.
 *
 * This regex requires node 10+ to be able to use /u and \p.
 *
 */
const NCName =
  "(?:[_\\p{Ll}\\p{Lu}\\p{Lt}\\p{Lo}\\p{Nl}][_.\\p{L}\\p{M}\\p{Nd}\\p{Nl}-]*)";

/** Match a QName
 *
 * Paraphrasing https://en.wikipedia.org/wiki/QName
 * - A QName is an NCName (see above)
 * - Or two of them delimited by a colon.
 *
 * Note: for our purposes, we *require* a colon delimiter - it can't just be a NCName.
 * This is because we need an abbreviation with which to look up the URL prefix.
 *
 * FIXME Perhaps we should also disallow common URI scheme prefixes.
 * FIXME Maybe we don't care about unicode?
 *
 * This regex requires node 10+ to be able to use /u and \p.
 *
 */
const QNameRx = new RegExp(`^${NCName}[:]${NCName}$`, "gsu");

const Location = z.array(z.number()).min(2).max(2);
const DatasetId = z.string().regex(UrlSafeBase64Rx);
const DatasetItemId = z.coerce.number().int().nonnegative();
const DatasetItem = z.object({}).passthrough();
const Dataset = z.array(Location);
const QName = z.string().regex(QNameRx);
const VersionInfo = z.object({}).passthrough();
const ErrorInfo = z.object({ message: z.string() }).passthrough();

export const schemas = {
  Location,
  DatasetId,
  DatasetItemId,
  DatasetItem,
  Dataset,
};

export const contract = c.router({
  getDataset: {
    method: "GET",
    path: "/dataset/:datasetId",
    summary: "obtains a dataset",
    description:
      "Obtains a dataset by its ID, which by passing in the appropriate options, might be in different formats",
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
      "Obtains an array of dataset item IDs, which match the search criteria supplied",
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
      200: z.array(DatasetItemId).openapi({
        // description: "the dataset item IDs matching the supplied criteria",
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
    path: "/dataset/:datasetId/item/:datasetItemId",
    summary: "obtains a dataset item by its unique ID",
    description:
      "Obtains a single dataset item by its ID and the dataset's ID.",
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
      datasetItemId: DatasetItemId.openapi({
        // description: "uniquely specifies the dataset item wanted",
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

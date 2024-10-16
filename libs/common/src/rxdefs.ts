/** Regular expression definitions */

/** A regex testing for an *URL-safe* base64 string (RFC4648 sect 5) */
export const UrlSafeBase64 = /^[A-Za-z0-9_-]+$/imsu;

/** A regular expression matching an XML NCName
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
 * This definition is is wrapped in a non-capturing group to isolate it without affecting
 * captures which may be defined around it in derived regular expressions.
 *
 * This regex requires node 10+ to be able to use /u and \p.
 *
 */
export const NCName =
  /(?:[_\p{Ll}\p{Lu}\p{Lt}\p{Lo}\p{Nl}][_.\p{L}\p{M}\p{Nd}\p{Nl}-]*)/imsu;

/** Match a QName
 *
 * Paraphrasing https://en.wikipedia.org/wiki/QName
 * - A QName is an NCName (see above)
 * - Or two of them delimited by a colon.
 *
 * Note: for our purposes, we *require* a colon delimiter - it can't just be a NCName.
 * This is because we need an abbreviation with which to look up the URL prefix.
 *
 * This definition is is wrapped in a non-capturing group to isolate it without affecting
 * captures which may be defined around it in derived regular expressions.
 *
 * FIXME Perhaps we should also disallow common URI scheme prefixes.
 * FIXME Maybe we don't care about unicode?
 *
 * This regex requires node 10+ to be able to use /u and \p.
 *
 */
export const QName = new RegExp(
  `^${NCName.source}[:]${NCName.source}$`,
  "imsu",
);

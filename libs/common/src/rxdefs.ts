/** Regular expression definitions */
import RxUtils from "./rxutils.js";
const { min, seq, conc, maybe, oneOf } = RxUtils;

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
export const QName = new RegExp(`${NCName.source}[:]${NCName.source}`, "imsu");

/** Match an AbbrevUri
 *
 * An abbreviated URI. This is essentially a QName without the second NCName.
 *
 * It represent a pre-defined URI base using the abbreviated name, followed by a
 * colon.
 */
export const AbbrevUri = new RegExp(`${NCName.source}[:]`, "imsu");

/** A Prefix-URI scheme.
 *
 * Note, limited to http and https.
 */
const Scheme = /https?:\/\//;

/** A domain name component.
 *
 * A letter, optionally followed by letters, digits or hyphens, but ending with a letter or digit.
 *
 * Based on https://datatracker.ietf.org/doc/html/rfc1035#section-2.3.1
 */
const DomainLabel = /[A-Za-z](?:[A-Za-z0-9-]*[A-Za-z0-9])?/;

/** A domain name.
 *
 * A domain label optionally followed by more domain labels, each prefixed with a period
 *
 * Based on https://datatracker.ietf.org/doc/html/rfc1035#section-2.3.1
 */
const Domain = seq(DomainLabel, min(0, seq("[.]", DomainLabel)));

/** A percent-encoded URI character. */
const PctEnc = /%[0-9A-Fa-f]{2}/;

// URI reserved characters
// reserved /[:/?#\[\]@!$&'()*+,;=]/;

/** A valid (non-percent-encoded) URI path character.
 *
 * Path characters can be any of:
 * - unreserved chars /[A-Za-z0-9._~-]/
 * - percent-encoded chars i./%[A-Za-z0-9]{2}/
 * - sub-delims chars /[!$&'()*+,;=]/
 * - colon or at chars /[:@]/
 *
 * Based on https://datatracker.ietf.org/doc/html/rfc3986#section-3.3
 */
const PathChar = /[A-Za-z0-9._~!$&'()*+,;=:@-]/;

/** A segment of a URI path, without '/' delimiters. */
const PathSegment = min(1, PctEnc, PathChar);

// This is roughly based on the RFC's "path-abempty" syntax - the other kinds
// seem not to fit a http URL, or be special cases of path-abempty
// (path-absolute, path-noscheme, path-rootless, path-empty)
const Path = seq(min(0, seq("/", PathSegment)), maybe("/"));

/** Matches a Prefix URI.
 *
 * A prefix URI is one which is a common prefix to a linked-data SKOS vocab
 * namespace, i.e. one to which the term IDs can be suffixed to, in order to get
 * a full URI for the term. It also tends to be a URI for the SKOS vocab as a
 * whole.
 *
 * Constructed based on the RFC3986 spec, narrowed for our purposes.
 * https://datatracker.ietf.org/doc/html/rfc3986
 *
 * This does not match the full specification of an URI as outloned in RFC3986,
 * as we have more restrictive ideas of a valid URI. Specifically:
 * - no local URIs, like http://localhost
 * - no IPv6 ot IPv6 hostnames
 * - no port address, like http://example.com:1234
 * - no user or password, like http://joe:secret@example.com
 * - only http or https schemes (not ftp, gopher, ldap, etc; also we insist on lower case)
 * - no querystring, like http://example.com/somewhere?querystring
 * - a trailing anchor character ("#") is allowed, but nothing more (the URI needs to be
 *   ready for anchor IDs to be suffixed)
 *
 */
export const PrefixUri = conc(Scheme, Domain, Path, maybe("#"));

/** A valid (non-percent-encoded) URI path character, excluding `@`
 *
 * Characters can be any of:
 * - unreserved chars /[A-Za-z0-9._~-]/
 * - percent-encoded chars i./%[A-Za-z0-9]{2}/
 * - sub-delims chars /[!$&'()*+,;=]/
 * - colon chars /[:]/
 *
 * Modified version of PathChar above.
 */
const NonAtPathChar = /[A-Za-z0-9._~!$&'()*+,;=:-]/;

/** Match a DatasetItemId (identifier)
 *
 * This ID needs to be flexible enough to match user-supplied IDs. It can be
 * anything an URI path segment contains. Percent-encoding is needed for
 * anything not *literally* allowed in a path segment.
 *
 * It also needs to be distinct from DatasetItemIx, however. Therefore we don't use
 * the exact same definition as PathSegment: we disallow a `@` character at the start. If the
 * ID needs such a thing, it must use percent encoding for that character, i.e.
 * `%40`.
 *
 */
export const DatasetItemId = seq(
  min(1, PctEnc, NonAtPathChar),
  min(0, PctEnc, PathChar),
);

/** Match a DatasetItemIx (index)
 *
 * This is basically a non-negative integer, representing an offset into the dataset.
 * However, it needs to be a bit distinct from a DatasetItemId, so the rule is that
 * it starts with an `@` symbol.
 *
 */
export const DatasetItemIx = seq(/@/, min(1, /\d/));

/** Match a DatasetItemId or a DatasetItemIx,
 *
 * Nominally this means:
 *
 *    oneOf(DatasetItemId, DatasetItemIx);
 *
 * However, we can simplify that just by using PathSegment, whch amounts to the
 * same thing (as the former is designed to match PathSegment patterns, but exclude
 * DatasetItemIx patterns, so recombined they are equivalent to PathSegment)
 */
export const DatasetItemIdOrIx = PathSegment;

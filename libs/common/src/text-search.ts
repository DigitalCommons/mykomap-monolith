/** NOTE - this is a cut-down excerpt from Mykomap 3.x's state-manager.ts
 * code.  We don't currently need the rest of it. But if we do recover the rest,
 * this should probably be merged back into that.
 * One difference to note also: this lower-cases, rather than upper-cases.
 */

/** Text search utilities */
export class TextSearch {
  /** Normalises a text string into an indexable form.
   *
   * Performs these steps:
   * - Lower-cases it
   * - Eliminates non word-breaking punctuation (`\`'`)
   * - Converts all other punctuation to space characters.
   * - Deduplicates whitespace
   * - Trims whitespace from front and back of the string.
   */
  static normalise(text: string): string {
    return text
      .toLowerCase()
      .replace(/['`]/, "") // eliminate non word-breaking punctuation
      .replace(/[^\w ]+/g, " ") // all other punctuation to space
      .replace(/\s+/g, " ") // deduplicate whitespace
      .trim(); // trim whitespace from front and back
  }
}

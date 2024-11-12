/** CSV related functions */
import { createReadStream } from "node:fs";
import { Stream } from "node:stream";
import { Parser, Schema, inferSchema, initParser } from "udsv";

/** A function which transforms a CSV row into some target type
 *
 * @returns an instance of type T, or undefined, if this row should be ignored.
 */
export type RowTransformer<T> = (row: string[]) => T | undefined;

/** A class to manage the nitt-gritty details of the CSV parsing
 * and buffering of rows.
 *
 * Created with a schema instance, call .parse() once for every string block
 * read from the CSV, then call .end(). The rows get appended to .buffer,
 * and you need to remove them yourself periodically, between and after
 * calls to the above.
 */
class CsvAccumulator<T> {
  /** We accumulate blocks of items into this buffer.They must be processed
   * periodically and the buffer emptied,
   */
  readonly buffer: T[][] = [];

  /** A parser created from the schema */
  readonly parser: Parser;

  /** Constructor */
  constructor(
    readonly schema: Schema,
    readonly transformer: RowTransformer<T>,
  ) {
    this.parser = initParser(schema);
  }

  /** Call this on all incoming string chunks. */
  parse(strChunk: string) {
    // parser.chunk()  may call the supplied function, now or later
    this.parser.chunk<string[]>(strChunk, this.parser.stringArrs, (rows) =>
      this.consumeRows(rows),
    );
  }

  /** This consumes rows and pushes any transformed items onto the buffer */
  private consumeRows(rows: string[][]): void {
    // convert rows and buffer the items
    this.buffer.push(
      rows
        .map(this.transformer) // transform to items
        .filter((item): item is T => item !== undefined), // drop empties
    );
  }

  /** Call this when all chunks have been passed to parse()
   *
   * Any remaining data will be added to the buffer
   */
  end() {
    const final = this.parser.end<string[]>();
    this.consumeRows(final);
  }
}

/** A generator function for iterating over items in a CSV parsed from a stream
 *
 * The items are parsed into an array of strings, then passed to a transformer
 * function which transforms them into an arbitrary type. The transformer is
 * built once the schema is available, using the row transformer builder function.
 *
 * @param textStream - a text stream to read the CSV frorm
 * @param mkRowtransformer - a function which, given the CSV schema, returns a function
 * which transforms a row following that schema into an instance of type T, or undefined
 * if that row should be skipped.
 */
export async function* fromCsvStream<T>(
  textStream: ReadableStream<string>,
  mkRowTransformer: (schema: Schema) => RowTransformer<T>,
) {
  let acc: CsvAccumulator<T> | undefined;

  for await (const strChunk of textStream) {
    if (!acc) {
      const schema = inferSchema(strChunk);
      acc = new CsvAccumulator(schema, mkRowTransformer(schema));
    }

    // This fills the buffer in acc
    acc.parse(strChunk);

    for (const batch of acc.buffer) {
      yield* batch;
    }
    acc.buffer.length = 0; // ... empty the buffer afterwards.
  }

  // Yield the final rows, if there are any
  if (acc) {
    acc.end(); // this fills the buffer

    for (const batch of acc.buffer) {
      yield* batch;
    }
    acc.buffer.length = 0; // empty the buffer
  }
}

/** A generator function for iterating over items in a CSV parsed from a file
 *
 * @param path - the path of the CSV file
 * @param mkRowtransformer - a function which, given the CSV schema, returns a function
 * which transforms a row following that schema into an instance of type T, or undefined
 * if that row should be skipped.
 */
export async function* fromCsvFile<T>(
  path: string,
  mkRowTransformer: (schema: Schema) => RowTransformer<T>,
) {
  const stream = createReadStream(path);

  try {
    const webStream = Stream.Readable.toWeb(stream);
    const textStream = webStream.pipeThrough(new TextDecoderStream());
    const csvIter = fromCsvStream(textStream, mkRowTransformer);
    yield* csvIter;
  } finally {
    stream.close();
  }
}

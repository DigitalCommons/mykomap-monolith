import { Command, Option, UsageError } from "clipanion";
import { ConfigData, VocabIndex, schemas } from "@mykomap/common";
import { slurpJson } from "@mykomap/node-utils";
import { zodCheck } from "./clipanion-interop.js";
import { DatasetItem, DatasetWriter } from "../dataset.js";
import { fromCsvFile } from "../csv.js";
import { PropSpecs, PropDefsFactory, parseAbbrevUri } from "@mykomap/common";
import { mkCsvParserGenerator } from "../dataset/csv.js";
import { cp } from "node:fs/promises";
import { join } from "node:path";

/** A command specification for importing datasets */
export class ImportCmd extends Command {
  static paths = [["import"]];

  /** The path to the dataset configuration to use */
  readonly configPath = Option.String();
  /** The path to the CSV to load */
  readonly csvPath = Option.String();
  /** The path to the dataset directory to create */
  readonly dataPath = Option.String();

  /** The default language code to use for vocabs */
  readonly defaultLang = Option.String("--lang", "en", {
    validator: zodCheck(schemas.Iso639Set1Code),
  });

  static usage = Command.Usage({
    description: "Converts datasets into the format used in the back-end",
    details: `
      Given a CSV file and a config file, creates a new dataset directory
      and populates it with data in the format used by the back end Mykomap server.

      The CSV data is validated and converted according to the "itemProps" section of
      the config file, which itself is validated to conform to the ConfigData schema defined
      in @mykomap/common.

      The vocabs used in the data must therefore be defined in the config file.

      An example of a config file is included in the tests, under:

          tests/data/dataset-cli/config.json

      Which is designed to work with the test case CSV file: 

          tests/data/dataset-cli/dummy.csv
`,
    examples: [
      [
        `Basic example`,
        `$0 import some/config.json some/data.csv output/itemID/`,
      ],
    ],
  });

  /** Executes the command */
  async execute(): Promise<void> {
    this.context.stdout.write(`Configured by: ${this.configPath}\n`);
    this.context.stdout.write(`Loading from: ${this.csvPath}\n`);
    this.context.stdout.write(`Writing to: ${this.dataPath}\n`);

    // Load the property definitions.
    //
    // Ideally we'd do this strictly all the way down, but Zod doesn't yet
    // support altering a composite type like that.  (Some code here but it
    // looks a bit too hairy to cut and paste
    // https://gist.github.com/jaens/7e15ae1984bb338c86eb5e452dee3010).
    //
    // Reason: we don't want anything silently stripped, and probabaly nor do we
    // want to silently pass through extras.
    const config: ConfigData = schemas.ConfigData.parse(
      await slurpJson(this.configPath),
    );

    // Our vocab definitions
    const vocabs: VocabIndex = config.vocabs; // Types from contract should be compatible

    // Our supported languages
    const langs = config.languages;

    // A PropDefsFactory instance using our vocab definitions
    const pds = new PropDefsFactory(vocabs, langs);

    const propSpecs: PropSpecs = config.itemProps; // Types from contract should be compatible
    const propDefs = pds.mkPropDefs(propSpecs);

    const mkTransformer = mkCsvParserGenerator(propDefs);
    const csvReader = fromCsvFile(this.csvPath, mkTransformer);

    try {
      const markerName = config.ui.marker_property_name;
      let dsWriter: DatasetWriter;

      if (markerName !== undefined) {
        const markerPropDef = propDefs[markerName];
        this.context.stdout.write(
          `Using the item property '${markerName}' to infer marker type to use,\n` +
            `which has the vocab ${markerPropDef.uri}. Full specification:\n` +
            `${JSON.stringify(propSpecs[markerName])}`,
        );
        const ncname = parseAbbrevUri(markerPropDef.uri, null);

        if (ncname !== null && ncname in config.vocabs) {
          const vocab = config.vocabs[ncname];
          const lang = Object.keys(vocab)[0];
          const terms = Object.keys(vocab[lang].terms || {}); // be defensive!

          // Extend DatasetWriter with an appropriate markerIndex method which
          // looks up a marker index from the selected item property, if set, in
          // the vocab terms.
          dsWriter = new (class extends DatasetWriter {
            override markerIndex(item: DatasetItem): number | undefined {
              const value = item[markerName];
              // note the loose inequality, matches null or undefined
              if (value != undefined) return terms.indexOf(String(value));
              return undefined;
            }
          })(propDefs);
        }
      }

      // If not set already, use this default FIXME detect errors?
      dsWriter ??= new DatasetWriter(propDefs);

      const stats = await dsWriter.writeDataset(this.dataPath, "id", csvReader);
      await cp(this.configPath, join(this.dataPath, "config.json"));
      this.context.stdout.write(
        `Success! statistics:\n${JSON.stringify(stats, null, 2)}\n`,
      );
    } catch (e) {
      let reason = e ? String(e) : "Unknown!";
      if (e instanceof Object && "cause" in e)
        reason += "\nbecause: " + String(e.cause);
      console.debug(e);
      throw new UsageError(reason);
    }
  }
}

import { Command, Option, UsageError } from "clipanion";
import { ConfigData, PropDefs, VocabIndex, schemas } from "@mykomap/common";
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
    this.context.stdout.write(`Writing to: ${this.dataPath}\n\n`);

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
    const pdf = new PropDefsFactory(vocabs, langs);

    const propSpecs: PropSpecs = config.itemProps; // Types from contract should be compatible
    const propDefs = pdf.mkPropDefs(propSpecs);

    const mkTransformer = mkCsvParserGenerator(propDefs);
    const csvReader = fromCsvFile(this.csvPath, mkTransformer);

    try {
      const markerName = config.ui.marker_property_name;

      // Construct an appropriate DatasetWriter for our case
      let dsWriter: DatasetWriter =
        markerName === undefined
          ? new DatasetWriter(propDefs)
          : this._mkDatasetWriterWithMarkerIcons(
              propSpecs,
              propDefs,
              config,
              markerName,
            );

      // Write out the dataset
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

  /** Helper method to construct a DatasetWriter instance for the case with marker icons.
   *
   * Also reports on the validation process to stdout, therefore specific to the usage here
   * in the Clipanion implementation.
   *
   * @param propSpecs: A PropSpecs collection. Used only for reports.
   * @param propDefs: A PropDefs corresponding to propSpecs. Used for construction.
   * @param markerName: The name of the PropDef to use to select marker icons for items. To
   * be validated before use.
   * @returns a new DatasetWriter if everything validates ok.
   */
  protected _mkDatasetWriterWithMarkerIcons(
    propSpecs: PropSpecs,
    propDefs: PropDefs,
    config: ConfigData,
    markerName: string,
  ): DatasetWriter {
    // If we get here, we have a marker property name configuration to interpret.
    // Get the associated property definition, if one exists, and validate it.
    const markerPropDef = propDefs[markerName];

    // Verify that markerPropDef exists and it's a property concerning a
    // vocab (singular or multi valued).
    if (markerPropDef == undefined)
      throw new Error(
        `No item property called '${markerName}' found in the config definitions`,
      );
    if (markerPropDef.uri == undefined)
      throw new Error(
        `The item property '${markerName}' is not a vocab property:\n` +
          JSON.stringify(propSpecs[markerName]),
      );

    // Now validated, report the situation on the console.
    this.context.stdout.write(
      `Using the item property '${markerName}' to infer marker type to use,\n` +
        `which has the vocab '${markerPropDef.uri}'.\nFull specification:\n` +
        JSON.stringify(propSpecs[markerName]) +
        "\n\n",
    );

    // Validate that markerPropDef.uri is one we know from the config
    const ncname = parseAbbrevUri(markerPropDef.uri, null);
    if (ncname == null)
      throw new Error(
        `The marker property '${markerName}' does not have a valid ` +
          `URI abbreviation: ` +
          markerPropDef.uri,
      );
    if (!(ncname in config.vocabs))
      throw new Error(
        `The marker property '${markerName}' does not reference a known ` +
          `vocab URI: ` +
          markerPropDef.uri,
      );

    // Now get the list of terms associated to that vocab
    const vocab = config.vocabs[ncname];
    const lang = Object.keys(vocab)[0];
    const termIndex = vocab[lang].terms || {}; // be defensive!
    const terms = Object.keys(termIndex);

    // Report the list of terms in use.
    this.context.stdout.write(
      "Vocab terms are mapped to icon indexes as follows:\n" +
        terms
          .map((term, ix) => ` - #${ix}: ${term}\t"${termIndex[term]}"`)
          .join("\n") +
        "\n\n",
    );

    // Extend DatasetWriter with an appropriate markerIndex method which
    // looks up a marker index from the selected item property, if set, in
    // the vocab terms.
    //
    // Returns one of:
    // - undefined (no value or an empty list),
    // - the index of a vocab term (a single matching value)
    // - the number of vocab terms (if a multiple valued list)
    // - minus one (if a single unmatching value)
    return new (class extends DatasetWriter {
      override markerIndex(item: DatasetItem): number | undefined {
        let value = item[markerName];

        // Check there's a value present. Note the loose inequality,
        // matches null or undefined.
        if (value == undefined) return undefined;

        if (markerPropDef.type !== "multi") {
          // A singlar value
          return terms.indexOf(String(value));
        }

        // Must be a list of values
        const values = value as Array<string>;
        switch (values.length) {
          case 0:
            return undefined; // No values
          case 1:
            return terms.indexOf(String(values[1])); // Single valued array
          default:
            return terms.length; // Multiple value array
        }
      }
    })(propDefs);
  }
}

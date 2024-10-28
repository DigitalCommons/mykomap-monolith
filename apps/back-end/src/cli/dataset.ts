import { Command, Option, UsageError } from "clipanion";
import { VocabIndex, schemas } from "@mykomap/common";
import { slurpJson } from "@mykomap/node-utils";
import { zodCheck } from "./clipanion-interop.js";
import { DatasetWriter } from "../dataset.js";
import { fromCsvFile } from "../csv.js";
import { PropSpecs, PropDefServices } from "@mykomap/common";
import { mkCsvParserGenerator } from "../dataset/csv.js";

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
      Given a CSV file and a config file, writes a new directory which could be directly 
      incorporated into the back-end filesystem data.

      Currently the fields and vocabs are hardwired into the code.
      Later this should be configurable.
`,
    examples: [[`Basic example`, `$0 import some/data.csv datasets/itemID/`]],
  });

  /** Executes the command */
  async execute(): Promise<void> {
    this.context.stdout.write(`Configured by: ${this.configPath}\n`);
    this.context.stdout.write(`Loading from: ${this.csvPath}\n`);
    this.context.stdout.write(`Writing to: ${this.dataPath}\n`);

    // Load the property definitions
    const config = schemas.ConfigData.parse(await slurpJson(this.configPath));

    // Our vocab definitions
    const vocabs: VocabIndex = config.vocabs; // Types from contract should be compatible

    // A PropDefServices instance using our vocab definitions
    const pds = new PropDefServices(vocabs, this.defaultLang);

    const propSpecs: PropSpecs = config.itemProps; // Types from contract should be compatible
    const propDefs = pds.mkPropDefs(propSpecs);

    const mkTransformer = mkCsvParserGenerator(propDefs);
    const csvReader = fromCsvFile(this.csvPath, mkTransformer);

    try {
      const dsWriter = new DatasetWriter(propDefs);
      const stats = await dsWriter.writeDataset(this.dataPath, "id", csvReader);
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

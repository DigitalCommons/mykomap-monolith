import { join } from "node:path";
import { existsSync } from "node:fs";
import { open, mkdir, writeFile, FileHandle } from "node:fs/promises";
import {
  TextSearch,
  PropDefs,
  Dictionary,
  stringify,
  toPoint2d,
  notNullish,
} from "@mykomap/common";
import { ValidationError } from "./dataset/csv.js";
import markers from "../../front-end/src/components/map/markers.js";

/** Information supplied to PropParser functions via `this` */
export interface PropParserInfo<I, O> {
  ix: number; // source CSV column index
  from?: string; // source CSV column header
  to: string; // destination property name
  parser: PropParser<I, O>; // the parser function
}

/** A generic parser for property values.
 *
 * @param this: information about the property being parsed
 * @param v: the value to parse
 * @returns the parsed result.
 */
export type PropParser<I, O> = (this: PropParserInfo<I, O>, v: I) => O;

/** An item from a dataset.
 *
 * Essentially this is a dictionary of arbitrary (typically primitive) unknown
 * values, but there are a few properties which should be
 * present in all cases.
 *
 * Note, multiple values represented by arrays are supported.
 * Elements of these should be the same type.
 *
 * Note: if one of lat or lng properties are absent or undefined,
 * both should be.
 */
export interface DatasetItem {
  /** A unique identifier within the dataset for this item
   *
   * (Not to be confused with its index)
   */
  id: string;

  /** An optional name, which may be displayed on the map as a tooltip */
  name?: string;

  /** A geographical latitude coordinate */
  lat?: number;

  /** A geographical longitude coordinate */
  lng?: number;

  /** Everything else! */
  [key: string]: unknown;
}

/** Writes datasets to the filesystem in a form usable by the back-end */
export class DatasetWriter {
  /** Will be populated with the properties which are searchable */
  readonly searchedProps: string[] = [];

  /** Will be populated with the properties which are filterable */
  readonly filteredProps: string[] = [];

  /** Constructs a writer
   *
   * @param props - property definitions for the DatasetItems
   * @param searchProp - the special property of item index objects into which the
   * "searchable string" - the searchable text index - should be put.
   */
  constructor(
    readonly props: PropDefs,
    readonly searchProp: string = "searchString",
  ) {
    // Identify these searched and filtered properties
    for (const propName in this.props) {
      const propDef = this.props[propName];

      if (propDef.search) this.searchedProps.push(propName);

      if (propDef.isFiltered()) this.filteredProps.push(propName);
    }
  }

  /** A JSON.stringify replacer for arrays of numbers
   *
   * Limits the decimals to 5 DP. This is as much resolution as a world map
   * with building-level precesion needs.
   */
  limitDecimals(_: string, value: any): any {
    const type = typeof value;
    switch (type) {
      case "number":
        return Number(value.toFixed(5));
      case "string":
        return Number(Number(value).toFixed(5));
      default:
        return value;
    }
  }

  /** A JSON.stringify replacer for objects.
   *
   * As above, but only alters  lat/lng properties
   */
  limitLatLngDecimals(key: string, value: any): any {
    if (key === "lat" || key === "lng") {
      if (value == null) return null; // note: nullish comparison
      return Number(Number(value).toFixed(5));
    }
    return value;
  }

  /** Write the dataset
   *
   * @param string - the path of the directory to create and populate.
   * It must not pre-exist.
   * @param id - the ID for the dataset. Used in error messages.
   * @param items - a stream of DatasetItems to write.
   */
  async writeDataset(
    dirPath: string,
    id: string,
    items: AsyncIterable<DatasetItem>,
    markerPropertyName: string | undefined,
  ) {
    if (existsSync(dirPath))
      throw new Error(
        `Cannot create dataset with existing filesystem path: ${dirPath}`,
      );

    const itemsDir = "items";
    await mkdir(join(dirPath, itemsDir), { recursive: true });

    let locationFile: FileHandle | undefined;
    let searchableFile: FileHandle | undefined;
    const stats: {
      counter: number;
      written: number;
      errors: { message: string; id: string; ix: number }[];
    } = { counter: 0, written: 0, errors: [] };

    const ids = new Set(); // track duplicates with this

    // Get the list of filterable property names
    const filterablePropNames = Object.entries(this.props)
      .map(([name, prop]) => (prop.filter ? name : undefined))
      .filter(notNullish);
    filterablePropNames.push(this.searchProp); // This synthetic prop needs to be included

    try {
      locationFile = await open(join(dirPath, "locations.json"), "w");
      searchableFile = await open(join(dirPath, "searchable.json"), "w");

      // Write the opening delimiter of the locations
      locationFile.write("[");
      // And the opening header of the searchables - indent the object keys so
      // they stand out as different. The result is intentionally somewhat CSV-like.
      searchableFile.write(
        `{   "itemProps":\n` +
          JSON.stringify(filterablePropNames) +
          `,\n    "values":[\n`,
      );

      // Write out each item
      for await (const item of items) {
        if (ids.has(item.id)) {
          stats.errors.push({
            message: `duplicate ID`,
            ix: stats.counter++,
            id: item.id,
          });
          continue;
        }
        ids.add(item.id);

        if (stats.written !== 0) {
          // insert delimiters
          await locationFile.write(",");
          await searchableFile.write(",\n");
        }

        // Write the location. Limit the decimals, don't indent.
        // Bad locations -> null. Note order of coordinates matches
        // GeoJSON's, i.e. longitude first.
        // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.1
        const point = toPoint2d([item.lng, item.lat], null);

        if (point && markerPropertyName) {
          const customMarkerIndex = Object.keys(markers).findIndex(
            (markerId) => markerId === item[markerPropertyName],
          );
          point.push(customMarkerIndex);
        }

        const pointJson = JSON.stringify(point, this.limitDecimals);
        await locationFile.write(pointJson);

        // Write the searchable. No indentation.
        const searchableItem = this.extractFilterable(item);
        searchableItem[this.searchProp] = this.textIndex(item);

        const searchableItemString = JSON.stringify(
          Object.values(searchableItem),
        );
        await searchableFile.write(searchableItemString);

        // Write the data item. Indent it this time.
        // Limit the lat/lng decimals as before.
        const itemPath = join(
          dirPath,
          itemsDir,
          stats.written.toString() + ".json",
        );
        const json = JSON.stringify(item, this.limitLatLngDecimals, "  ");
        await writeFile(itemPath, json);

        stats.counter += 1;
        stats.written += 1;
      }

      // Write the closing delimiter of these JSON files
      await locationFile.write("]");
      await searchableFile.write("\n]}");
    } catch (e) {
      if (e instanceof ValidationError)
        throw new Error(`validation error parsing item #${stats.counter}`, {
          cause: e,
        });

      throw new Error(
        `unexpected error creating dataset '${id}' parsing item #${stats.counter} at '${dirPath}'`,
        { cause: e },
      );
    } finally {
      if (searchableFile) searchableFile.close();
      if (locationFile) locationFile.close();
    }
    return stats;
  }

  /** Extracts the filterable properties from a DatasetItem to a plain object */
  extractFilterable(item: DatasetItem) {
    const filterable: Dictionary<unknown> = {};
    this.filteredProps.forEach(
      (propName) => (filterable[propName] = item[propName]),
    );
    return filterable;
  }

  /** Makes a searchable text index value from a DatasetItem */
  textIndex(item: DatasetItem): string | undefined {
    // Extract the normalised version of the searchable properties
    const normText = this.searchedProps.map((propName) => {
      const propDef = this.props[propName];
      const value = item[propName];

      const text = propDef.textForValue(value);
      if (typeof text === "string") return TextSearch.normalise(text);
      if (text instanceof Array)
        return text.map((v) => TextSearch.normalise(v)).join(" ");
      return TextSearch.normalise(stringify(text));
    });

    return normText.join(" ");
  }
}

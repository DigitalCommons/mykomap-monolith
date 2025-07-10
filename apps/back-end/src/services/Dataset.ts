import fs from "node:fs";
import path from "node:path";
import _ from "lodash";
import { ConfigData } from "@mykomap/common";

import {
  PropDefs,
  PropDefsFactory,
  schemas,
  TextSearch,
  yesANumber,
} from "@mykomap/common";
import { HttpError } from "../errors.js";

export class Dataset {
  id: string;
  folderPath: string;
  config: ConfigData;
  about: string;
  propDefs: PropDefs;
  searchablePropIndexMap: { [field: string]: number };
  searchablePropValues: (string | string[])[][];

  constructor(id: string, dataRoot: string) {
    this.id = id;
    this.folderPath = path.join(dataRoot, "datasets", id);

    // Load the config
    this.config = schemas.ConfigData.parse(
      JSON.parse(
        fs.readFileSync(path.join(this.folderPath, "config.json"), "utf8"),
      ),
    );

    // Load the About text
    this.about = fs.readFileSync(
      path.join(this.folderPath, "about.md"),
      "utf8",
    );

    // Create prop defs
    const pdf = new PropDefsFactory(this.config.vocabs, this.config.languages);
    this.propDefs = pdf.mkPropDefs(this.config.itemProps);

    // Load the searchable.json
    const searchable: { itemProps: string[]; values: (string | string[])[][] } =
      JSON.parse(
        fs.readFileSync(path.join(this.folderPath, "searchable.json"), "utf8"),
      );

    // Sanity check searchable.json is roughly the correct format (which should be done after generation)
    const hasSearchStringField = searchable.itemProps.includes("searchString");
    const uniqueItemProps =
      new Set(searchable.itemProps).size === searchable.itemProps.length;
    const filterableItemPropsInConfig = Object.entries(this.config.itemProps)
      .filter(([prop, def]) => def.filter)
      .map(([prop, def]) => prop);
    const sameItemPropsAsConfig = haveSameElements(
      [...filterableItemPropsInConfig, "searchString"],
      searchable.itemProps,
    );
    const expectedValuesLengths = searchable.values
      .map((arr: (string | string[])[]) => arr.length)
      .every((v: number) => v === searchable.itemProps.length);

    if (
      hasSearchStringField &&
      uniqueItemProps &&
      sameItemPropsAsConfig &&
      expectedValuesLengths
    ) {
      // Passed sanity checks
      this.searchablePropValues = searchable.values;

      this.searchablePropIndexMap = {};
      searchable.itemProps.forEach((field, index) => {
        this.searchablePropIndexMap[field] = index;
      });
    } else {
      throw new Error(
        `searchable.json for dataset ${this.id} has a bad format ` +
          `(hasSearchStringField: ${hasSearchStringField}, uniqueItemProps: ${uniqueItemProps}, ` +
          `sameItemPropsAsConfig: ${sameItemPropsAsConfig}, expectedValuesLengths: ${expectedValuesLengths})`,
      );
    }
  }

  getItem = (itemIx: number) => {
    if (!fs.existsSync(path.join(this.folderPath, "items", `${itemIx}.json`))) {
      throw new HttpError(
        404,
        `Can't retrieve data for dataset ${this.id}, item index @${itemIx}`,
      );
    }

    return JSON.parse(
      fs.readFileSync(
        path.join(this.folderPath, "items", `${itemIx}.json`),
        "utf8",
      ),
    );
  };

  getConfig = () => this.config;

  getAbout = () => this.about;

  getLocations = (): fs.ReadStream =>
    fs.createReadStream(path.join(this.folderPath, "locations.json"), "utf8");

  getTotals = () => {
    const totals: Record<string, number> = {
      any: 0,
    };

    // TODO: make this an argument of getTotals, so it can be used for filters as well as the
    // directory panel
    const propId = this.config.ui.directory_panel_field;
    const propIndex = this.searchablePropIndexMap[propId];

    this.searchablePropValues.forEach((itemValues) => {
      const value = itemValues[propIndex];
      // if value is a single string, wrap it in an array
      const valuesToCount = typeof value === "string" ? [value] : value;

      valuesToCount.forEach((value) => {
        totals[value] = 1 + (totals[value] ?? 0);
      });
      totals.any = 1 + (totals.any ?? 0);
    });

    return totals;
  };

  /**
   * Returns an array of item indexes that match the given criteria, or an array of objects if
   * returnProps is specified. Also supports pagination, if `page` and pageSize are defined
   */
  search = (
    filters?: string[],
    text?: string,
    returnProps?: string[],
    page?: number,
    pageSize?: number,
  ): (string | { [prop: string]: unknown })[] => {
    const propMatchers: {
      propIndex: number;
      propMatcher: (value: string | string[]) => boolean;
    }[] =
      filters?.map((filter) => {
        // ts-rest + Zod have already validated that the filter is a valid QName
        const splitQName = filter.split(":");
        const [propName, valueRequired] = splitQName;

        const propDef = this?.propDefs[propName];
        if (!propDef?.isFiltered())
          throw new HttpError(400, `Unknown propery name '${propName}'`);

        const isMulti = propDef.type === "multi";
        const propMatcher = (value: string | string[]) => {
          if (isMulti) {
            if (typeof value === "string") {
              console.warn(
                `Values for multi prop should be in array, but just take this single value (dataset ${this.id}, value ${value}`,
              );
              return value === valueRequired;
            } else if (value instanceof Array) {
              return value.includes(valueRequired);
            } else {
              console.error(
                `Invalid value format (dataset ${this.id}, value ${value}`,
              );
              return false;
            }
          } else {
            if (typeof value === "string") {
              return value == valueRequired;
            } else {
              console.error(
                `Invalid value format (dataset ${this.id}, value ${value}`,
              );
              return false;
            }
          }
        };

        return {
          propIndex: this.searchablePropIndexMap[propName],
          propMatcher,
        };
      }) ?? [];

    if (text) {
      const normalisedText = TextSearch.normalise(text);
      propMatchers.push({
        propIndex: this.searchablePropIndexMap["searchString"],
        propMatcher: (value: string | string[]) => {
          if (typeof value === "string") {
            return value.includes(normalisedText);
          } else {
            console.error(
              `Invalid searchString, it must be a string (dataset ${this.id}, value ${value}`,
            );
            return false;
          }
        },
      });
    }

    const visibleIndexes = this.searchablePropValues
      .map((itemValues, itemIx) =>
        // item must match all given propMatchers
        propMatchers.every(({ propIndex, propMatcher }) =>
          propMatcher(itemValues[propIndex]),
        )
          ? itemIx
          : "",
      )
      .filter(yesANumber);

    // Default - no pagination (`page` or `pageSize` absent), return everything
    let startIx = 0;
    let endIx = visibleIndexes.length;

    // If `page` and `pageSize` parameters given, just return the page in question.
    // `pageSize` is constrained by the contract to be > 0
    if (page !== undefined && pageSize != undefined) {
      startIx = page * pageSize;
      endIx = startIx + pageSize;
    }

    return visibleIndexes.slice(startIx, endIx).map((itemIx) => {
      if (returnProps) {
        const item = this.getItem(itemIx);
        // Return only the requested properties
        const strippedItem: { [prop: string]: unknown } = {};

        for (const prop of returnProps) {
          if (item[prop] === undefined) {
            throw new HttpError(400, `Unknown propery name '${prop}'`);
          }
          strippedItem[prop] = item[prop];
        }

        return {
          index: `@${itemIx}`,
          ...strippedItem,
        };
      } else {
        return `@${itemIx}`;
      }
    });
  };
}

const haveSameElements = (arr1: string[], arr2: string[]) =>
  _.isEmpty(_.xor(arr1, arr2));

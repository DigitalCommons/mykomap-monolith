import fs from "node:fs";
import path from "node:path";
import _ from "lodash";
import { TsRestResponseError } from "@ts-rest/core";
import { z } from "zod";

import {
  contract,
  PropDefs,
  PropDefsFactory,
  schemas,
  TextSearch,
} from "@mykomap/common";

// Infer type from Zod schema
type ConfigData = z.infer<typeof schemas.ConfigData>;

export class Dataset {
  id: string;
  folderPath: string;
  config: ConfigData;
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

    // Create prop defs
    const pdf = new PropDefsFactory(this.config.vocabs, "en");
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

  getItem = (itemId: number) => {
    if (
      !fs.existsSync(
        path.join(this.folderPath, "initiatives", `${itemId}.json`),
      )
    ) {
      throw new TsRestResponseError(contract.getDatasetItem, {
        status: 404,
        body: {
          message: `can't retrieve data for dataset ${this.id} item ${itemId}`,
        },
      });
    }

    return JSON.parse(
      fs.readFileSync(
        path.join(this.folderPath, "initiatives", `${itemId}.json`),
        "utf8",
      ),
    );
  };

  getConfig = () => this.config;

  getLocations = (): fs.ReadStream =>
    fs.createReadStream(path.join(this.folderPath, "locations.json"), "utf8");

  search = (filters?: string[], text?: string): number[] => {
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
          throw new TsRestResponseError(contract.searchDataset, {
            status: 400,
            body: {
              message: `Unknown propery name '${propName}'`,
            },
          });

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

    return this.searchablePropValues
      .map((itemValues, itemIx) =>
        // item must match all given propMatchers
        propMatchers.every(({ propIndex, propMatcher }) =>
          propMatcher(itemValues[propIndex]),
        )
          ? itemIx
          : "",
      )
      .filter((v) => typeof v === "number");
  };
}

const haveSameElements = (arr1: string[], arr2: string[]) =>
  _.isEmpty(_.xor(arr1, arr2));

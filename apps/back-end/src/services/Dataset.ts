import fs from "node:fs";
import path from "node:path";
import { TsRestResponseError } from "@ts-rest/core";

import { contract } from "@mykomap/common";

export class Dataset {
  id: string;
  folderPath: string;
  searchable: ({ [prop: string]: string } & { searchString: string })[];

  constructor(id: string, dataRoot: string) {
    this.id = id;
    this.folderPath = path.join(dataRoot, "datasets", id);
    this.searchable = JSON.parse(
      fs.readFileSync(path.join(this.folderPath, "searchable.json"), "utf8"),
    );
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

  getConfig = () => {
    // TODO: implementation
    return {};
  };

  getLocations = (): fs.ReadStream =>
    fs.createReadStream(path.join(this.folderPath, "locations.json"), "utf8");

  search = (filter?: string[], text?: string): number[] => {
    // TODO: implementation
    return [];
  };
}

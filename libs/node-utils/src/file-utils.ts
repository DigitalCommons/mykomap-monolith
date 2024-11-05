import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

/** Read a file asynchronously, given its path
 */
async function slurp(
  path: string,
  opts: {
    enc?: BufferEncoding;
  } = {},
): Promise<string> {
  return readFile(path, opts.enc ?? "utf8").then((it) => it.toString());
}

/** Read a file synchronously, given its path
 */
function slurpSync(
  path: string,
  opts: {
    enc?: BufferEncoding;
  } = {},
): string {
  return readFileSync(path, opts.enc ?? "utf8").toString();
}

/** Read in a JSON file asynchronously, given its path. */
async function slurpJson(
  path: string,
  reviver?: (this: any, key: any, value: any) => any,
): Promise<undefined[]> {
  return slurp(path).then((x) => JSON.parse(x, reviver));
}

/** Read in a JSON file synchronously, given its path. */
function slurpJsonSync(
  path: string,
  reviver?: (this: any, key: any, value: any) => any,
): Promise<undefined[]> {
  return JSON.parse(slurpSync(path), reviver);
}

export { slurp, slurpSync, slurpJson, slurpJsonSync };

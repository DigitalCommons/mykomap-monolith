/** Defines some utility types */

import { z } from "zod";
import { schemas } from "./api/contract.js";

/** Maps any type K to a type V
 *
 * Elements are explicitly optional, courtesy of Partial
 */
export type Assoc<K extends keyof any, V> = Partial<Record<K, V>>;

/** Maps strings to a type V (which defaults to string)
 *
 * Elements are explicitly optional, courtesy of Partial
 */
export type Dictionary<V = string> = Assoc<string, V>;

/** A 2 dimensional point tuple */
export type Point2d = [number, number];

/** A 2 dimensional bounding box */
export type Box2d = [Point2d, Point2d];

/** Clears all the keys from an object */
export function clear<V>(obj: Assoc<string, V>) {
  Object.keys(obj).forEach((key) => delete obj[key]);
}
/** This describes certain parameters of the build of a software project managed by git.
 *
 * Specifically, this software!
 */
export type BuildInfo = z.infer<typeof schemas.BuildInfo>;

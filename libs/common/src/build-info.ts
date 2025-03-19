/** Utilities for capturing information about the build */
import { BuildInfo, sentryDist, sentryRelease } from "./index.js";

/** A method which executes a command and returns its output */
export type Exec = (cmd: string, args: string[]) => string;

/** This describes certain parameters of the build of a software project managed by git.
 *
 * It is an immutable implementation of BuildInfo, which gets its version and
 * commitDesc information from `git-describe` (by default).
 */
export class ReadonlyBuildInfo implements BuildInfo {
  // https://github.com/microsoft/TypeScript/issues/3841#issuecomment-2415542548
  declare ["constructor"]: typeof ReadonlyBuildInfo;

  /** A stub method for executing commands.
   *
   * Typically this will be a reference to `spawnSync`, provided by NodeJS. But
   * since we want this class to be defined without NodeJS dependencies, so it
   * can be included everywhere and only used in vite.config.ts, it needs to be
   * provided via the constructor.
   */
  private readonly exec: Exec;

  /** The name of the software component */
  readonly name: string;

  /* The time it was built. Should be a UTC ISO string as returned by Date.toISOString() */
  readonly buildTime: string;

  /** The commit descriptor. Should be a string as returned by gitDescribe() */
  readonly commitDesc: string;

  /** The tagged version. Should be a numeric array as returned by
   * gitVersion() */
  readonly version: readonly number[];

  /** The build environment. A string, typically 'development' or 'production',
   * but may be an empty string if nothing is set */
  readonly nodeEnv: string;

  /** Convenience method to get a sentryRelease string for this instance */
  get sentryRelease(): string {
    return sentryRelease(this);
  }

  /** Convenience method to get a sentryDist string for this instance */
  get sentryDist(): string {
    return sentryDist(this);
  }

  /** Obtain a numeric version array from git tags.
   *
   * Calls `git-describe` to search backwards in the git history for the last
   * "versiony" tag. Meaning, a match for any tag beginning with a `v`, followed
   * by one or more unsigned decimal numbers delimited by single periods.
   *
   * It then attempts to parse that by splitting on non-numeric characters and
   * converting to a list of positive integers.
   *
   * Assumes the code is running in a git working directory!
   *
   * If we can't find any matching tags, we return an array with a single zero:
   * `[0]`
   *
   */
  gitVersion(): number[] {
    /*
      This matches the glob pattern `v[0-9]*`, but excludes matches with: any
      non-decimal-non-period characters after that; double periods; or ending with
      a period. This is about the best we can do globs to match cases
      like `v1`, `v1.2`, `v10.111.12` etc. but exclude `v.1`, `v1.` or `v1..2`.

      (Although double periods or trailing periods seem to be invalid tags in any
      case.)
    */
    const versionStr = this.exec("git", [
      "describe",
      "--tags",
      "--match=v[0-9]*",
      "--exclude=v*[^0-9.]*",
      "--exclude=*..*",
      "--exclude=*.",
      "--abbrev=0",
    ]).trim();

    const version =
      typeof versionStr === "string"
        ? versionStr.substring(1).split(".").map(Number)
        : [0];

    return version;
  }

  /** Get the git-describe commit information.
   *
   * This provides version information for a more discerning audience. It uses
   * `git-describe` to search back through the history for any tag at all.
   *
   * The result will be a string with the format: "[<TAG>-<COUNT>-]<COMMIT-ID>[-dirty]"
   * - Items in square brackets may be absent.
   * - TAG is the last "versiony" tag found in the commit history, if there is one,
   *   otherwise this and the next dash delimiter are omitted.
   * - COUNT is the number of commts from the tag (or the first commit if none) to the current commit.
   * - COMMIT-ID is the abbreviated SHA1 commit ID.
   * - A "dirty" suffix indicates a build in a dirty working directory.
   * - Note that TAG may contain any character a tag can, including a hyphen.
   * - Therefore it might not be a version string.
   *
   * (See the docs for `gitVersion` for the meaning of "versiony".)
   */
  gitDescribe(): string {
    const commitDesc = this.exec("git", [
      "describe",
      "--tags",
      "--match=v[0-9]*",
      "--exclude=v*[^0-9.]*",
      "--always",
      "--long",
      "--dirty",
    ]).trim();

    return commitDesc;
  }

  updatePackageJson(): void {
    const { version, sentryRelease } = this;
    this.exec("npm", [
      "pkg",
      "set",
      "version=" + version.join("."),
      "config.sentry.release=" + sentryRelease,
    ]);
  }

  /** Constuctor.
   *
   * The `name` parameter is required, all others have defaults inferred from `git-describe`
   */
  constructor(
    buildInfo: Pick<BuildInfo, "name"> & Partial<BuildInfo> & { exec: Exec },
  ) {
    // Get the Vite env mode. Commented - this should typechecking, but seems not to be?
    //const envMode = envMode: import.meta.env.MODE ?? '';

    this.exec = buildInfo.exec;
    this.name = buildInfo.name;
    this.buildTime = buildInfo?.buildTime ?? new Date().toISOString(); // should be UTC
    this.commitDesc = buildInfo?.commitDesc ?? this.gitDescribe();
    this.version = buildInfo?.version ?? this.gitVersion();
    this.nodeEnv = buildInfo?.nodeEnv ?? process.env.NODE_ENV ?? "";

    // Mark the `exec` property unenumerable, so that this class is
    // stringifiable - a requirement for it to be used as a Vite build-time
    // define value.
    Object.defineProperty(this, "exec", { enumerable: false });
  }
}

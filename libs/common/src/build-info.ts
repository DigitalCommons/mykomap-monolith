/** Utilities for capturing information about the build */
import { BuildInfo, sentryDist, sentryRelease } from "./index.js";

/** A method which executes a command and returns its output */
export type Exec = (cmd: string, args: string[]) => string;

/** Environment variables, as in process.env */
export type Env = Record<string, string | undefined>;

/** The version from the first line of CHANGELOG.md.
 *
 * The file starts with a heading for the current release, e.g.
 * `# v4.2.0 - 2026-09-24`, so the version is read from the code rather than
 * from git tags. Throws when the first line is not in that form.
 */
export function changelogVersion(changelog: string): string {
  const firstLine = changelog.split(/\r?\n/, 1)[0] ?? "";
  const match = firstLine.match(
    /^# v(\d+\.\d+\.\d+(?:\+\d+)?) - \d{4}-\d{2}-\d{2}$/,
  );
  if (!match)
    throw new Error(
      `CHANGELOG.md must start with "# vX.Y.Z - YYYY-MM-DD", found "${firstLine}"`,
    );
  return match[1];
}

/** Describes a build of a software project.
 *
 * An immutable implementation of BuildInfo. The version is the one in the
 * project's package.json, passed in by the caller. The commit description
 * comes from `git describe` when building in a git checkout, otherwise from
 * the SOURCE_COMMIT environment variable that Coolify sets for image builds.
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

  /** The environment variables to consult, typically process.env */
  private readonly env: Env;

  /** The name of the software component */
  readonly name: string;

  /* The time it was built. Should be a UTC ISO string as returned by Date.toISOString() */
  readonly buildTime: string;

  /** The commit descriptor. Should be a string as returned by gitDescribe() */
  readonly commitDesc: string;

  /** The version from package.json, e.g. "4.2.0" or "4.2.1+1" for a hotfix */
  readonly version: string;

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

  /** Get the git-describe commit information.
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
   * A "versiony" tag begins with a `v` followed by decimal numbers delimited
   * by single periods.
   *
   * Returns an empty string when git is not available or this is not a git
   * checkout.
   */
  gitDescribe(): string {
    try {
      return this.exec("git", [
        "describe",
        "--tags",
        "--match=v[0-9]*",
        "--exclude=v*[^0-9.]*",
        "--always",
        "--long",
        "--dirty",
      ]).trim();
    } catch {
      return "";
    }
  }

  /** Describe the commit from the environment when there is no git checkout.
   *
   * Coolify sets SOURCE_COMMIT to the full commit ID when it builds an image
   * and the Dockerfiles pass it through as a build argument. It is shortened
   * to match the abbreviated ID `git describe` gives.
   */
  envDescribe(): string {
    const commit = this.env.SOURCE_COMMIT?.trim() ?? "";
    return commit.substring(0, 7);
  }

  /** Constuctor.
   *
   * `name` and `version` are required and come from package.json. The commit
   * description is inferred from git, then SOURCE_COMMIT, unless given.
   */
  constructor(
    buildInfo: Pick<BuildInfo, "name" | "version"> &
      Partial<BuildInfo> & { exec: Exec; env: Env },
  ) {
    this.exec = buildInfo.exec;
    this.env = buildInfo.env;
    this.name = buildInfo.name;
    this.version = buildInfo.version;
    this.buildTime = buildInfo.buildTime ?? new Date().toISOString(); // should be UTC
    this.commitDesc =
      buildInfo.commitDesc ||
      this.gitDescribe() ||
      this.envDescribe() ||
      "unknown";
    this.nodeEnv = buildInfo.nodeEnv ?? this.env.NODE_ENV ?? "";

    // Mark the helper properties unenumerable, so that this class is
    // stringifiable - a requirement for it to be used as a Vite build-time
    // define value.
    Object.defineProperty(this, "exec", { enumerable: false });
    Object.defineProperty(this, "env", { enumerable: false });
  }
}

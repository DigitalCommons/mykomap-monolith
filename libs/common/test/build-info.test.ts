import { describe, expect, test } from "vitest";
import {
  changelogVersion,
  ReadonlyBuildInfo,
  sentryRelease,
} from "../src/index.js";

const describeOutput = "v4.1.0-3-gabc1234-dirty\n";

/** An exec stub returning the given output for git describe */
const gitExec = (output: string) => (cmd: string, args: string[]) =>
  cmd === "git" && args[0] === "describe" ? output : "";

describe("ReadonlyBuildInfo", () => {
  test("takes the version string given to it", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.0",
      exec: gitExec(describeOutput),
      env: {},
    });
    expect(bi.version).toBe("4.2.0");
  });

  test("keeps build metadata in the version", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.1+1",
      exec: gitExec(""),
      env: {},
    });
    expect(bi.version).toBe("4.2.1+1");
  });

  test("describes the commit with git when there is a git checkout", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.0",
      exec: gitExec(describeOutput),
      env: { SOURCE_COMMIT: "0123456789abcdef0123456789abcdef01234567" },
    });
    expect(bi.commitDesc).toBe("v4.1.0-3-gabc1234-dirty");
  });

  test("falls back to the SOURCE_COMMIT build variable without git", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.0",
      exec: gitExec(""),
      env: { SOURCE_COMMIT: "0123456789abcdef0123456789abcdef01234567" },
    });
    expect(bi.commitDesc).toBe("0123456");
  });

  test("treats a failing git command as no git", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.0",
      exec: () => {
        throw new Error("spawn git ENOENT");
      },
      env: { SOURCE_COMMIT: "0123456789abcdef0123456789abcdef01234567" },
    });
    expect(bi.commitDesc).toBe("0123456");
  });

  test("reports an unknown commit when nothing describes it", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.0",
      exec: gitExec(""),
      env: {},
    });
    expect(bi.commitDesc).toBe("unknown");
  });

  test("serialises without the exec and env helpers", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/back-end",
      version: "4.2.0",
      buildTime: "2026-09-23T10:00:00.000Z",
      nodeEnv: "production",
      exec: gitExec(describeOutput),
      env: {},
    });
    expect(JSON.parse(JSON.stringify(bi))).toEqual({
      name: "@mykomap/back-end",
      version: "4.2.0",
      buildTime: "2026-09-23T10:00:00.000Z",
      nodeEnv: "production",
      commitDesc: "v4.1.0-3-gabc1234-dirty",
    });
  });
});

describe("changelogVersion", () => {
  test("reads the version from the first heading", () => {
    expect(changelogVersion("# v4.2.0 - 2026-09-24\n\n- notes\n")).toBe(
      "4.2.0",
    );
  });

  test("keeps hotfix build metadata", () => {
    expect(changelogVersion("# v4.2.1+1 - 2026-10-01\n")).toBe("4.2.1+1");
  });

  test("rejects a first line in any other form", () => {
    expect(() =>
      changelogVersion("# Changelog\n\n# v4.2.0 - 2026-09-24"),
    ).toThrow(/must start with/);
    expect(() => changelogVersion("# v4.2.0\n")).toThrow(/must start with/);
    expect(() => changelogVersion("")).toThrow(/must start with/);
  });
});

describe("sentryRelease", () => {
  test("joins the package name and version", () => {
    const bi = new ReadonlyBuildInfo({
      name: "@mykomap/front-end",
      version: "4.2.0",
      exec: gitExec(""),
      env: {},
    });
    expect(sentryRelease(bi)).toBe("@mykomapfront-end@4.2.0");
  });
});

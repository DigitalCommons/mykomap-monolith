// Tell TS what this is
declare const __BUILD_INFO__: {
  name: string;
  buildTime: string;
  version: number[];
  commitDesc: string;
  nodeEnv: "development"|"production";
};

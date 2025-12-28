import { ClientInferResponseBody } from "@ts-rest/core";
import { contract } from "@mykomap/common";

export type Config = ClientInferResponseBody<typeof contract.getConfig, 200>;

// This is the config of a popup item as definted in a dataset config.json
export type ConfigPopupItemRaw = Config["popup"]["leftPane"][number];

// This is the config of a popup item with the 'multiple' field derived from the itemProps config
export type ConfigPopupItem = ConfigPopupItemRaw & {
  multiple: boolean;
};

// And this is the full popup config with the 'multiple' field derived for each item
export type ConfigPopup = {
  titleProp: string;
  leftPaneWidth: string;
  leftPane: ConfigPopupItem[];
  topRightPane: ConfigPopupItem[];
  bottomRightPane: ConfigPopupItem[];
};

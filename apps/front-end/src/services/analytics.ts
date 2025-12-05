import mixpanel from "mixpanel-browser";
import { getDatasetId } from "../utils/window-utils";

let initialized = false;

// Initialize Mixpanel
const datasetId = getDatasetId();
if (datasetId) {
  if (import.meta.env.VITE_MIXPANEL_TOKEN) {
    mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
      debug: import.meta.env.DEV,
      track_pageview: false, // We'll manually track page views
      persistence: "localStorage",
      record_sessions_percent:
        import.meta.env.VITE_MIXPANEL_SESSION_RECORDING_PERCENT ?? 0,
    });

    mixpanel.register({
      dataset_id: datasetId,
    });

    initialized = true;
  } else {
    console.warn("Mixpanel token not found. Analytics will not be sent.");
  }
}

/** The list of events that are tracked in the form of "<Category>_<Action>" */
export const Event = {
  ITEM: {
    // User clicks a link in a popup
    //  These events aren't hardcoded here but generated dynamically based on the dataset's
    //  popup config. The event name is of the form "Item_<PropName>Click"
  },
  SEARCH: {
    // User clicks on a search result
    RESULT_CLICK: "Search_ResultClick",
  },
} as const;

// Recursively extract the union of values of the leaves of an object into a type
type LeafValues<T> = T extends object ? LeafValues<T[keyof T]> : T;

type EventName = LeafValues<typeof Event>;

/**
 * Track a raw analytics event
 */
export const trackEvent = (event: EventName, data?: Record<string, any>) => {
  if (initialized) {
    mixpanel.track(event, data);
  }
};

/**
 * This function is used to track dynamic events whose names are not known at compile time.
 * Currently used for the edge case of Item_WebsiteClick (used in CWM)
 */
export const trackDynamicEvent = (
  event: string,
  data?: Record<string, any>,
) => {
  if (initialized) {
    mixpanel.track(event, data);
  }
};

import mixpanel from "mixpanel-browser";
import { getDatasetId } from "../utils/window-utils";

let initialized = false;

export let DEVICE_ID: string;

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

    DEVICE_ID = mixpanel.get_distinct_id();

    // Include dataset ID in all analytics
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
    //// These events aren't hardcoded here but generated dynamically based on the dataset's popup
    //// config. The event name is of the form "Item_<PropName>Click"
    // User opens app using a shared link that points to a specific item
    SHARE: "Item_Share",
  },
  MAP: {
    // User opens app using a shared link that isn't pointing to any specific item or search result
    SHARE: "Map_Share",
  },
  SEARCH: {
    // User clicks on a search result
    RESULT_CLICK: "Search_ResultClick",
    // User opens app using a shared link for a specific search query
    SHARE: "Search_Share",
  },
} as const;

// Recursively extract the union of values of the leaves of an object into a type
type LeafValues<T> = T extends object ? LeafValues<T[keyof T]> : T;

type EventName = LeafValues<typeof Event>;

/**
 * Track a raw analytics event. This is the function to use for the vast majority of events, so that
 * there is better type checking.
 */
export const trackEvent = (
  eventName: EventName,
  data?: Record<string, any>,
) => {
  if (initialized) {
    mixpanel.track(eventName, data);
  } else if (import.meta.env.DEV) {
    console.log(`[Analytics] Track event: ${eventName} with data:`, data);
  }
};

/**
 * This function is used to track custom events specific to a particular dataset, where the event
 * name is defined via config and not known at compile time.
 * Currently only used for Item_WebsiteClick in CWM.
 */
export const trackCustomDatasetEvent = (
  eventName: string,
  data?: Record<string, any>,
) => {
  if (initialized) {
    mixpanel.track(eventName, data);
  } else if (import.meta.env.DEV) {
    console.log(`[Analytics] Track event: ${eventName} with data:`, data);
  }
};

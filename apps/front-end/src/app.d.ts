/** __BUILD_INFO__ is used to label builds via the Vite config.
 *
 * This tells TS what type it is.
 *
 * We use this import to reduce duplication, using a strange style forced on us
 * by TS.  See https://stackoverflow.com/a/66768386
 */
declare const __BUILD_INFO__: import("@mykomap/common").BuildInfo;

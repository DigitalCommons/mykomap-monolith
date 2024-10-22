/** A collection of Regular expression building utilities. */
const RxUtils = (() => {
  /** Map a string or RegExp to a string */
  const _str = (component: string | RegExp) =>
    component instanceof RegExp ? component.source : component;

  /** Wrap patterns in a non-capturing group, separated by a delimiter
   *
   * If there are more than one pattern, each one is also wrapped in a non-capturing group.
   *
   * Note, unlike the other functions here, this one is for internal use and
   * returns a string, not a RegExp.
   */
  const _wrap = (
    delim: "" | "|",
    ...components: Array<string | RegExp>
  ): string => {
    switch (components.length) {
      case 0:
        return "";
      case 1:
        return `(?:${_str(components[0])})`;
      default:
        return (
          "(?:" + components.map((c) => `(?:${_str(c)})`).join(delim) + ")"
        );
    }
  };

  /** Wrap patterns in a non-capturing group, separated by a delimiter.
   *
   * If there are more than one pattern, each one is also wrapped in a non-capturing group.
   */
  const wrap = (
    delim: "" | "|",
    ...components: Array<string | RegExp>
  ): RegExp => new RegExp(_wrap(delim, ...components));

  /** Simply concatenate the patterns passed, no grouping or delimiter */
  const conc = (...components: Array<string | RegExp>): RegExp =>
    new RegExp(components.map((c) => _str(c)).join(""));

  /** Match the patterns passed as a sequence */
  const seq = (...components: Array<string | RegExp>): RegExp =>
    new RegExp(_wrap("", ...components));

  /** Match just one of the patterns passed */
  const oneOf = (...components: Array<string | RegExp>): RegExp =>
    new RegExp(_wrap("|", ...components));

  /** Match at least n of one the patterns passed */
  const min = (n: 0 | 1, ...components: Array<string | RegExp>): RegExp => {
    const expr = _wrap("|", ...components);
    switch (n) {
      case 0:
        return new RegExp(`${expr}*`);
      case 1:
        return new RegExp(`${expr}+`);
    }
  };

  /** Matches zero or one of the patterns passed */
  const maybe = (...components: Array<string | RegExp>): RegExp => {
    const expr = _wrap("|", ...components);
    return new RegExp(`${expr}?`);
  };

  /** Match unicode, all or nothing.
   *
   * Ensures the regular expression has msu flags and is anchored to match all
   * of a string or nothing.
   */
  const uaon = (component: string | RegExp): RegExp => {
    let [expr, flags] =
      component instanceof RegExp
        ? [component.source, component.flags]
        : [component, ""];

    expr = expr.replace(/^\^?/ms, "^"); // ensure anchor at start
    expr = expr.replace(/\$?$/ms, "$"); // ensure anchor at end

    // Extend and deduplicate flags
    flags = [...new Set((flags + "msu").split(""))].join("");

    return new RegExp(expr, flags);
  };

  return { conc, maybe, min, seq, oneOf, uaon, wrap };
})();

export default RxUtils;

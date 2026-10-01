/**
 * Drops the datasets that another listed dataset is an alias of, so a
 * symlink such as cwm-latest and the directory it points at show as one
 * entry (the alias, which carries the directory's ID in aliasOf).
 */
export const hideAliasTargets = <T extends { id: string; aliasOf?: string }>(
  entries: T[],
): T[] => {
  const targets = new Set(entries.map((e) => e.aliasOf));
  return entries.filter((e) => !targets.has(e.id));
};

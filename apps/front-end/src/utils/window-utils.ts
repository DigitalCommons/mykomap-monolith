export const getUrlSearchParam = (param: string): string | null =>
  new URLSearchParams(window.location.search).get(param);

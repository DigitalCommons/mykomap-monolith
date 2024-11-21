export const renderIfData = (
  element: JSX.Element,
  data: (string | undefined)[],
) => (data.some((d) => !!d) ? element : null);

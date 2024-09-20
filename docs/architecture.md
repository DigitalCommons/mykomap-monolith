# Architecture diagrams

## System architecture

![Diagram](images/architecture-system.drawio.svg)

## Front-end architecture

![Diagram](images/architecture-front-end.drawio.svg)

### Possible improvements

- Move the GeoJSON data to the Redux store. Having 2 separate stores complicates the architecture and goes against the Redux principle of having a [single source of truth](https://redux.js.org/understanding/thinking-in-redux/three-principles#single-source-of-truth). The performance shouldn't be impacted, if we make sure to use [memoization](https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization) correctly.

- It doesn't make sense to pass marker data and MapLibre click events through a MapContainer React component. We should either:

  1. Keep the non-React MapLibre component fully separate from the React components so that they only communicate via Redux. The MapLibre GL component can subscribe to Redux store separately https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks. Although note that if we want to use eventually render the popups using MUI React components (see next bullet point), we won't be able to keep a totally clean separation.
  2. Use the `react-map-gl` binding, and use React and React-Redux hooks throughout the app. This would reduce some complexity and fragmentation of design patterns, but mean that it's harder to move the MapLibre component to a non-React codebase in the future. What is the likelihood of us needing to do this, without needing the search/directory panels too (which are written fully in React)?

- The API could provide popup contents as a JSON, which is then rendered by the front-end in React, rather than sending plain HTML. This will make it easier to keep consistent styling across the app, and for the popups to interact more freely with the rest of the UI elements. But maybe this is difficult to achieve, since the popups are highly customizable per map variant.
  - Alternatively, we can try to move some UI styling code to the common lib, so that it can be used to style a HTML popup element in each of the map variants. Not sure how possible this is with Material UI, but maybe [this CSS library](https://www.muicss.com/) is similar enough to the MUI component library we're using

## Back-end architecture

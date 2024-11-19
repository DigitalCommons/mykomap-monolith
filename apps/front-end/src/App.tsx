import { useEffect } from "react";
import MapWrapper from "./components/map/MapWrapper";
import Panel from "./components/panel/Panel";
import { fetchConfig, setLanguage } from "./app/configSlice";
import { useAppDispatch } from "./app/hooks";
import { getUrlSearchParam } from "./utils/window-utils";
import Popup from "./components/popup/Popup";

const App = () => {
  const dispatch = useAppDispatch();

  /** Startup tasks */
  useEffect(() => {
    dispatch(fetchConfig()).then(() => {
      const urlParamLang = getUrlSearchParam("lang")?.toLowerCase();
      if (urlParamLang) dispatch(setLanguage(urlParamLang));
    });

    fetch(`${import.meta.env.VITE_API_URL}/version`)
      .then((response) => response.json())
      .then((versionInfo) => {
        console.log("API version info", versionInfo);
      })
      .catch((error) => {
        console.error(
          "Error fetching API version info",
          error.message,
          import.meta.env.VITE_API_URL,
        );
      });
  }, []);

  return (
    <div>
      <MapWrapper />
      <Panel />
      <Popup />
    </div>
  );
};

export default App;

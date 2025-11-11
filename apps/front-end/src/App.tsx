import { useEffect } from "react";
import { useSearchParams } from "react-router";
import MapWrapper from "./components/map/MapWrapper";
import Panel from "./components/panel/Panel";
import { fetchConfig, setLanguage } from "./app/configSlice";
import { useAppDispatch } from "./app/hooks";
import { getLanguageFromUrl } from "./utils/window-utils";
import Popup from "./components/popup/Popup";
import Logo from "./components/common/Logo/Logo";

const App = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams(new window.URLSearchParams());

  /** Startup tasks */
  useEffect(() => {
    dispatch(fetchConfig()).then(() => {
      const urlParamLang = getLanguageFromUrl();
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
      <MapWrapper searchParams={searchParams} setSearchParams={setSearchParams} />
      <Logo />
      <Panel searchParams={searchParams} setSearchParams={setSearchParams} />
      <Popup />
    </div>
  );
};

export default App;

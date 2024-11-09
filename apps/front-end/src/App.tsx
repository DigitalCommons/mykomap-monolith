import { useEffect } from "react";
import MapWrapper from "./components/map/MapWrapper";
import Panel from "./components/panel/Panel";
import logo from "./logo.svg";
import { fetchConfig, setLanguage } from "./app/configSlice";
import { useAppDispatch } from "./app/hooks";
import { getUrlSearchParam } from "./utils/window-utils";

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchConfig()).then(() => {
      const urlParamLang = getUrlSearchParam("lang")?.toLowerCase();
      if (urlParamLang) dispatch(setLanguage(urlParamLang));
    });
  }, []);

  return (
    <div>
      <MapWrapper />
      <Panel />
    </div>
  );
};

export default App;

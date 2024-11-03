import { useEffect } from "react";
import MapWrapper from "./components/map/MapWrapper";
import Panel from "./components/panel/Panel";
import logo from "./logo.svg";
import { fetchConfig } from "./app/vocabsSlice";
import { useAppDispatch } from "./app/hooks";

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchConfig());
  }, []);

  return (
    <div>
      <MapWrapper />
      <Panel />
    </div>
  );
};

export default App;

import { Counter } from "./features/counter/Counter";
import MapWrapper from "./features/map/MapWrapper";
import SearchBar from "./features/filter/SearchBar";
import { Quotes } from "./features/quotes/Quotes";
import logo from "./logo.svg";

const App = () => {
  return (
    <div>
      <MapWrapper />
      <SearchBar />
    </div>
  );
};

export default App;

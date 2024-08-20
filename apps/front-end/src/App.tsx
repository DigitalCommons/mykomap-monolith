import { Counter } from "./features/counter/Counter";
import Map from "./features/map/Map";
import SearchBar from "./features/filter/SearchBar";
import { Quotes } from "./features/quotes/Quotes";
import logo from "./logo.svg";

const App = () => {
  return (
    <div>
      <Map />
      <SearchBar />
    </div>
  );
};

export default App;

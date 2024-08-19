import { Counter } from "./features/counter/Counter";
import Map from "./features/map/Map";
import { Quotes } from "./features/quotes/Quotes";
import logo from "./logo.svg";

function bang() {
  console.log("BANG!");
  throw "bang error";
  console.log("BANG?");
  return undefined;
}

const App = () => {
  return (
    <>
    <div>
      <button onClick={bang}>Break the world</button>
    </div>
      </>
  );
};

export default App;

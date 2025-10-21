import "./styles/App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Roulette from "./pages/Roulette";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );

  function App() {
    return (
      <div>
        <Roulette />
      </div>
    );
  }
}

export default App;

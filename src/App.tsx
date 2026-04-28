import "./App.css";
import {  Routes, Route } from "react-router";
import Rootlayoute from "./Rootlayoute";
import Home from "./Component/Pages/Home";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Rootlayoute />}>
          <Route path="/" element={<Home />} />         
        </Route>
      </Routes>
    </>
  );
}

export default App;

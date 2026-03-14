import React from "react";
import MapComponent from "./Pages/MapComponent.jsx";
import Home from "./Pages/Home.jsx";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapComponent />} />
    </Routes>
  );
};

export default App;
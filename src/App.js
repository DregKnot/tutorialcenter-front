import { Route, Routes } from "react-router-dom";
import About from "./pages/public/About";
import Home from "./pages/public/Home.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/test" element={<div className="text-red-300">Test Page</div>} />
      </Routes>
    </>
  );
}

export default App;

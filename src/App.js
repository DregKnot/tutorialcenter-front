import { Route, Routes } from "react-router-dom";
import About from "./pages/public/About";
import Home from "./pages/public/Home.jsx";
import SignUp from "./pages/public/SignUp.jsx";
import Login from "./pages/public/Login.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<div className="text-red-300">Test Page</div>} />
      </Routes>
    </>
  );
}

export default App;

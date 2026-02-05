import About from "./pages/public/About";
import Home from "./pages/public/Home.jsx";
import Login from "./pages/public/Login.jsx";
import SignUp from "./pages/public/SignUp.jsx";
import { Route, Routes } from "react-router-dom";
import StudentRegistration from "./pages/public/StudentSignUp/StudentRegistration.jsx";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<SignUp />} />

        {/* Student Public Routes */}
        <Route path="/register/student" element={<StudentRegistration />} />
      </Routes>
    </>
  );
}

export default App;

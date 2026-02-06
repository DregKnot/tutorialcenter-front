import About from "./pages/public/About";
import Home from "./pages/public/Home.jsx";
import Login from "./pages/public/Login.jsx";
import SignUp from "./pages/public/SignUp.jsx";
import { Route, Routes } from "react-router-dom";
import StudentRegistration from "./pages/public/StudentSignUp/StudentRegistration.jsx";
import StudentPhoneVerification from "./pages/public/StudentSignUp/StudentPhoneVerification.jsx";
import StudentEmailVerification from "./pages/public/StudentSignUp/StudentEmailVerification.jsx";

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
        <Route path="/register/student/phone/verify" element={<StudentPhoneVerification />} />
        <Route path="/register/student/email/verify" element={<StudentEmailVerification />} />
      </Routes>
    </>
  );
}

export default App;

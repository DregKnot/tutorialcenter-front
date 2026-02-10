import About from "./pages/public/About";
import Home from "./pages/public/Home.jsx";
import Login from "./pages/public/Login.jsx";
import SignUp from "./pages/public/SignUp.jsx";
import { Route, Routes } from "react-router-dom";
import StudentRegistration from "./pages/public/StudentSignUp/StudentRegistration.jsx";
import StudentPhoneVerification from "./pages/public/StudentSignUp/StudentPhoneVerification.jsx";
import StudentEmailVerification from "./pages/public/StudentSignUp/StudentEmailVerification.jsx";
import StudentBiodata from "./pages/public/StudentSignUp/StudentBiodata.jsx";
import StudentTrainingSelection from "./pages/public/StudentSignUp/StudentTrainingSelection.jsx";
import { StudentSubjectSelection } from "./pages/public/StudentSignUp/StudentSubjectSelection.jsx";
import { StudentTrainingDuration } from "./pages/public/StudentSignUp/StudentTrainingDuration.jsx";
import { StudentTrainingPayment } from "./pages/public/StudentSignUp/StudentTrainingPayment.jsx";
import StudentLogin from "./pages/public/StudentLogin.jsx";
import StudentDashboard from "./pages/students/StudentDashboard.jsx";
import ComingSoon from "./pages/public/ComingSoon.jsx";
import Unauthorized from "./pages/public/Unauthorized.jsx";
import NotFound from "./pages/public/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";


function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="*" element={<NotFound/>} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/comingsoon" element={<ComingSoon/>} />
        <Route path="/unauthorized" element={<Unauthorized/>} />

        {/* Student Public Registration Routes */}
        <Route path="/student/login" element={<StudentLogin/>} />
        {/* <Route path="/student/dashboard" element={<StudentDashboard/> }/> */}
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/student/biodata" element={<StudentBiodata/>} />
        <Route path="/register/student/phone/verify" element={<StudentPhoneVerification />} />
        <Route path="/register/student/email/verify" element={<StudentEmailVerification />} />
        <Route path = "/register/student/training/selection" element={<StudentTrainingSelection />} />
        <Route path = "/register/student/subject/selection" element={<StudentSubjectSelection />} />
        <Route path = "/register/student/training/duration" element={<StudentTrainingDuration />} />
        <Route path = "/register/student/training/payment" element={<StudentTrainingPayment />} />

        {/* Student Protected Routes */}
        <Route element={<ProtectedRoute />}>
        <Route path="/student/dashboard" element={<StudentDashboard/> }/>
        </Route>
      </Routes>
    </>
  );
}

export default App;

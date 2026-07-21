import About from "./pages/public/About.jsx";
import Home from "./pages/public/Home.jsx";
import Contact from "./pages/public/Contact.jsx";
import Career from "./pages/public/Career.jsx";
import Blog from "./pages/public/Blog.jsx";
import StudentBlog from "./components/private/Students/StudentBlog.jsx";
import Login from "./pages/public/StudentLogin.jsx";
import SignUp from "./pages/public/SignUp.jsx";
import StickyButtons from "./components/public/StickyButtons.jsx";
import { Route, Routes } from "react-router-dom";
import StudentRegistration from "./pages/public/StudentSignUp/StudentRegistration.jsx";
import StudentPhoneVerification from "./pages/public/StudentSignUp/StudentPhoneVerification.jsx";
import StudentEmailVerification from "./pages/public/StudentSignUp/StudentEmailVerification.jsx";
import StudentBiodata from "./pages/public/StudentSignUp/StudentBiodata.jsx";
import StudentTrainingSelection from "./pages/public/StudentSignUp/StudentTrainingSelection.jsx";
import { StudentSubjectSelection } from "./pages/public/StudentSignUp/StudentSubjectSelection.jsx";
import { StudentPaymentSuccessScreen } from "./pages/public/StudentSignUp/StudentPaymentSuccessScreen.jsx";

import { GuardianRegistration } from "./pages/public/GuardianSignup/GuardianRegistration.jsx";
import GuardianPhoneVerification from "./pages/public/GuardianSignup/GuardianPhoneVerification.jsx";
import GuardianEmailVerification from "./pages/public/GuardianSignup/GuardianEmailVerification.jsx";
import GuardianAddStudents from "./pages/public/GuardianSignup/GuardianAddStudents.jsx";
import AddedStudentOTP from "./pages/public/GuardianSignup/AddedStudentOTP.jsx";
import GuardianAddedStudentBiodata from "./pages/public/GuardianSignup/GuardianAddedStudentBiodata.jsx";
import GuardianTrainingSelection from "./pages/public/GuardianSignup/GuardianTrainingSelection.jsx";
import GuardianSubjectSelection from "./pages/public/GuardianSignup/GuardianSubjectSelection.jsx";
import GuardianTrainingDuration from "./pages/public/GuardianSignup/GuardianTrainingDuration.jsx";
import GuardianTrainingPayment from "./pages/public/GuardianSignup/GuardianTrainingPayment.jsx";

import { StudentTrainingDuration } from "./pages/public/StudentSignUp/StudentTrainingDuration.jsx";
import { StudentTrainingPayment } from "./pages/public/StudentSignUp/StudentTrainingPayment.jsx";
import StudentLogin from "./pages/public/StudentLogin.jsx";
import StudentDashboard from "./pages/Students/StudentDashboard.jsx";
import StudentNotifications from "./pages/Students/StudentNotifications.jsx";
import StaffNotification from "./components/private/staffs/StaffNotification.jsx";
import StudentPaymentDisplay from "./pages/Students/StudentPaymentDisplay.jsx";
import StudentClassSchedule from "./pages/Students/StudentClassSchedule.jsx";
import StudentCalendar from "./pages/Students/StudentCalendar.jsx";
import ComingSoon from "./pages/public/ComingSoon.jsx";
import Unauthorized from "./pages/public/Unauthorized.jsx";
import NotFound from "./pages/public/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import StaffLogin from "./pages/public/StaffLogin.jsx";
import StaffDashboard from "./pages/staffs/admin/StaffDashboard.jsx";
import StaffRegistration from "./pages/staffs/admin/StaffRegistration.jsx"
import StaffManagement from "./pages/staffs/admin/StaffManagement.jsx";
import AdminPaymentHistory from "./pages/staffs/admin/AdminPaymentHistory.jsx";
import TutorDashboard from "./pages/staffs/tutor/TutorDashboard.jsx";
import TutorMasterClass from "./pages/staffs/tutor/TutorMasterClass.jsx";
import CourseAdvisorDashboard from "./pages/staffs/courseadvisor/CourseAdvisorDashboard.jsx";
import CourseAdvisorStudentManagement from "./pages/staffs/courseadvisor/CourseAdvisorStudentManagement.jsx";
import CourseAdvisorGuardianManagement from "./pages/staffs/courseadvisor/CourseAdvisorGuardianManagement.jsx";
import CourseAdvisorComingSoon from "./pages/staffs/courseadvisor/CourseAdvisorComingSoon.jsx";
import CourseAdvisorMasterClass from "./pages/staffs/courseadvisor/CourseAdvisorMasterClass.jsx";
import CourseAdvisorCalendar from "./pages/staffs/courseadvisor/CourseAdvisorCalendar.jsx";
import TutorCalendar from "./pages/staffs/tutor/TutorCalendar.jsx";
import StaffMasterClassList from "./pages/staffs/admin/StaffMasterClassList.jsx";
import CoursesManagement from "./pages/staffs/admin/CoursesManagement.jsx";
import StudentPaymentHistory from "./pages/Students/StudentPaymentDisplay.jsx";
import StudentMeetWrapper from "./pages/Students/StudentMeetWrapper.jsx";
import StaffMeetWrapper from "./pages/staffs/StaffMeetWrapper.jsx";
import ClassRoom from "./pages/ClassRoom.jsx";
import StudentSettings from "./pages/Students/StudentSettings.jsx";
import RecordedClasses from "./pages/Students/RecordedClasses.jsx";
import StudentGames from "./pages/Students/StudentGames.jsx";
import StudentExam from "./pages/Students/StudentExam.jsx";
import StudentScholarship from "./pages/Students/StudentScholarship.jsx";
import StudentLeaderboard from "./pages/Students/StudentLeaderboard.jsx";
import StudentFeedback from "./pages/Students/StudentFeedback.jsx";
import StaffEmailVerification from "./pages/public/StaffSignUp/StaffEmailVerification.jsx";
import StaffFeedback from "./pages/staffs/StaffFeedback.jsx";
import AdminStudentManagement from "./pages/staffs/admin/AdminStudentManagement.jsx";
import ExamManagement from "./pages/staffs/admin/ExamManagement.jsx";
import ExamQuestion from "./components/private/staffs/exams/ExamQuestion.jsx";
import EditExamHeader from "./components/private/staffs/exams/EditExamHeader.jsx";
import ExamSubjectList from "./components/private/staffs/exams/ExamSubjectList.jsx";
import ExamYearList from "./components/private/staffs/exams/ExamYearList.jsx";
import ExamQuestionList from "./components/private/staffs/exams/ExamQuestionList.jsx";
import Training from "./pages/public/Training.jsx";
import CourseDetails from "./pages/public/CourseDetails.jsx";
// import { StaffAuthProvider } from "./context/StaffAuthContext.jsx";

function App() {
  return (
    <>

      <StickyButtons />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/career" element={<Career />} />
        <Route path="/career" element={<Career />} />
        <Route path="/training" element={<Training />} />
        <Route path="/program/:id" element={<CourseDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/staff-verify-email" element={<StaffEmailVerification />} />
        <Route path="/unauthorized" element={<Unauthorized />} />


        {/* Guardian Registration Routes */}
        <Route path="/register/guardian" element={<GuardianRegistration />} />
        <Route path="/register/guardian/phone/verify" element={<GuardianPhoneVerification />} />
        <Route path="/register/guardian/email/verify" element={<GuardianEmailVerification />} />
        <Route path="/register/guardian/addstudent" element={<GuardianAddStudents />} />
        <Route path="/register/guardian/student/otp-verification" element={<AddedStudentOTP />} />
        <Route path="/register/guardian/student/biodata" element={<GuardianAddedStudentBiodata />} />
        <Route path="/register/guardian/training/selection" element={<GuardianTrainingSelection />} />
        <Route path="/register/guardian/subject/selection" element={<GuardianSubjectSelection />} />
        <Route path="/register/guardian/training/duration" element={<GuardianTrainingDuration />} />
        <Route path="/register/guardian/training/payment" element={<GuardianTrainingPayment />} />

        {/* Student Public Registration Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/student/biodata" element={<StudentBiodata />} />
        <Route path="/register/student/phone/verify" element={<StudentPhoneVerification />} />
        <Route path="/register/student/email/verify" element={<StudentEmailVerification />} />
        <Route path="/register/student/training/selection" element={<StudentTrainingSelection />} />
        <Route path="/register/student/subject/selection" element={<StudentSubjectSelection />} />
        <Route path="/register/student/training/duration" element={<StudentTrainingDuration />} />
        <Route path="/register/student/training/payment" element={<StudentTrainingPayment />} />
        <Route path="/register/student/training/payment/success" element={<StudentPaymentSuccessScreen />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/classroom/:classSessionId" element={<ClassRoom />} />
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/payments" element={<StudentPaymentDisplay />} />
          <Route path="/student/payment-history" element={<StudentPaymentHistory />} />
          <Route path="/student/class-schedule" element={<StudentClassSchedule />} />
          <Route path="/student/calendar" element={<StudentCalendar />} />
          <Route path="/student/meet" element={<StudentMeetWrapper />} />
          <Route path="/student/settings" element={<StudentSettings />} />
          <Route path="/student/feedback" element={<StudentFeedback />} />
          <Route path="/student/recorded-classes" element={<RecordedClasses />} />
          <Route path="/student/games" element={<StudentGames />} />
          <Route path="/student/exams" element={<StudentExam />} />
          <Route path="/student/scholarship" element={<StudentScholarship />} />
          <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
          <Route path="/student/blog" element={<StudentBlog />} />

          {/* Staff Routes */}
          <Route path="/staffs/dashboard" element={<StaffDashboard />} />
          <Route path="/staffs/feedback" element={<StaffFeedback />} />
          <Route path="/staffs/notifications" element={<StaffNotification />} />
          <Route path="/staffs/meet" element={<StaffMeetWrapper />} />
          <Route path="/staffs/tutor/dashboard" element={<TutorDashboard />} />
          <Route path="/staffs/tutor/master-class" element={<TutorMasterClass />} />
          <Route path="/staffs/tutor/calendar" element={<TutorCalendar />} />
          <Route path="/staffs/course-advisor/dashboard" element={<CourseAdvisorDashboard />} />
          <Route path="/staffs/course-advisor/students" element={<CourseAdvisorStudentManagement />} />
          <Route path="/staffs/course-advisor/guardians" element={<CourseAdvisorGuardianManagement />} />
          <Route path="/staffs/course-advisor/master-class" element={<CourseAdvisorMasterClass />} />
          <Route path="/staffs/course-advisor/calendar" element={<CourseAdvisorCalendar />} />
          <Route path="/staffs/course-advisor/exams" element={<CourseAdvisorComingSoon title="Exams" />} />
          <Route path="/staffs/course-advisor/settings" element={<CourseAdvisorComingSoon title="Settings" />} />
          <Route path="/staffs/staff-registration" element={<StaffRegistration />} />
          <Route path="/staffs/manage-staffs" element={<StaffManagement />} />
          <Route path="/staffs/manage-students" element={<AdminStudentManagement />} />
          <Route path="/staffs/master-class" element={<StaffMasterClassList />} />
          <Route path="/staffs/manage-courses" element={<CoursesManagement />} />
          <Route path="/staffs/manage-exams" element={<ExamManagement />} />
          <Route path="/staffs/manage-exams/question" element={<ExamQuestion />} />
          <Route path="/staffs/manage-exams/question/:id" element={<ExamQuestion />} />
          <Route path="/staffs/manage-exams/edit/:id" element={<EditExamHeader />} />
          <Route path="/staffs/manage-exams/:bodyId/subjects" element={<ExamSubjectList />} />
          <Route path="/staffs/manage-exams/:bodyId/subjects/:subjectId/years" element={<ExamYearList />} />
          <Route path="/staffs/manage-exams/:bodyId/subjects/:subjectId/years/:yearId/questions" element={<ExamQuestionList />} />
          <Route
            path="/staffs/payments"
            element={<AdminPaymentHistory />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login_img from "../../assets/images/login_img.jpg";
import TC_logo from "../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../assets/svg/return arrow.svg";
import SplashScreen from "../../components/public/SplashScreen";


const Login = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState(null);

  const handleContinue = () => {
    if (!userRole) {
      setErrors({ userRole: true });
      return;
    }
    if (userRole === 'student') {
      navigate('/student/login');
    }
    setErrors({});
    // Navigate to next login step (credentials)
    // For now, it might just move to a similar step as SignUp's Step 2
    console.log("Proceeding to log in as:", userRole);
  };

  if (showSplash) return <SplashScreen />;

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* LEFT SIDE: The Visual Image */}
      <div
        className="w-full h-[250px] md:w-1/2 md:h-full bg-cover bg-center relative bg-gray-300 order-1"
        style={{ backgroundImage: `url(${login_img})` }}
      >
        {/* Sign Up Button (Desktop Only) */}
        <div className="hidden md:block absolute bottom-[70px] right-0 translate-x-9">
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 bg-white text-[#09314F] font-bold hover:bg-gray-100 transition-all shadow-xl rounded-full"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Content Area */}
      <div className="w-full md:w-1/2 h-full bg-[#F4F4F4] flex flex-col relative px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        {/* 1. TOP NAV */}
        <div className="relative w-full flex items-center justify-center mb-8 md:mb-10">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 p-2 hover:bg-gray-200 rounded-full transition-all z-10"
          >
            <img src={ReturnArrow} alt="Back" className="h-6 w-6 lg:h-5 lg:w-5" />
          </button>
          <img
            src={TC_logo}
            alt="Logo"
            className="h-[60px] md:h-[80px] w-auto object-contain"
          />
        </div>

        {/* 2. CENTER PIECE */}
        <div className="flex flex-col items-center w-full my-auto transition-all">
          <div className="text-center mb-4 transition-all">
            <h1 className="text-3xl font-bold text-[#09314F]">Log In</h1>
            <p className="text-gray-500 text-sm max-w-[300px] mx-auto mt-2 transition-all">
              Welcome back! Log in to continue your journey with us.
            </p>
          </div>

          <div
            className={`bg-white shadow-sm border rounded-lg p-6 flex flex-col items-center
                       w-full max-w-[369px] md:w-[369px] md:min-h-[280px] transition-all
                       ${errors.userRole ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-gray-100'}`}
          >
            {/* Student Button */}
            <button
              onClick={() => setUserRole("student")}
              className={`w-full h-[50px] mb-4 rounded-xl flex items-center justify-between px-6 font-semibold text-base transition-all border-2
                ${userRole === "student" ? "bg-[#76D287] text-white border-transparent" : "bg-[#FFF5F5] text-[#09314F] border-transparent"}`}
            >
              STUDENT
              {userRole === "student" && <span>✓</span>}
            </button>

            {/* Guardian Button */}
            <button
              onClick={() => setUserRole("guardian")}
              className={`w-full h-[50px] mb-8 md:mb-12 rounded-xl flex items-center justify-between px-6 font-semibold text-base transition-all border-2
                ${userRole === "guardian" ? "bg-[#76D287] text-white border-transparent" : "bg-[#FFF5F5] text-[#09314F] border-transparent"}`}
            >
              GUARDIAN / PARENT
              {userRole === "guardian" && <span>✓</span>}
            </button>

            {/* Continue Button (Desktop - Inside Card) */}
            <div className="hidden md:block w-full mt-auto">
              <button
                onClick={handleContinue}
                className="w-full h-[60px] text-white rounded-xl font-bold transition-all duration-500 shadow-md active:scale-95"
                style={{
                  background: userRole
                    ? "linear-gradient(90deg, #09314F 0%, #E33629 100%)"
                    : "#5F5F5F",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Continue Button (Mobile - Fixed Bottom) */}
        <div className="md:hidden fixed bottom-10 left-0 w-full px-6 z-20">
          <button
            onClick={handleContinue}
            className="w-full h-[60px] text-white rounded-xl font-bold transition-all duration-500 shadow-xl active:scale-[0.98]"
            style={{
              background: userRole
                ? "linear-gradient(90deg, #09314F 0%, #E33629 100%)"
                : "#5F5F5F",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import SplashScreen from "../../components/public/SplashScreen";
import ComingSoon from "../../components/public/ComingSoon";
import StepOne from "./Student _Sign_up/StepOne";
import StepTwo from "./Student _Sign_up/StepTwo";
import StepThree from "./Student _Sign_up/StepThree";
import StepFour from "./Student _Sign_up/StepFour";
import GuardianStepFour from "./Guardian_SignUp/GuardianStepFour";
import StepFive from "./Student _Sign_up/StepFive";
import GuardianStepFive from "./Guardian_SignUp/GuardianStepFive";
import StepSix from "./Student _Sign_up/StepSix";
import GuardianStepSix from "./Guardian_SignUp/GuardianStepSix";
import StepSeven from "./Student _Sign_up/StepSeven";
import GuardianStepSeven from "./Guardian_SignUp/GuardianStepSeven";
import StepEight from "./Student _Sign_up/StepEight";
import GuardianStepEight from "./Guardian_SignUp/GuardianStepEight";
import StepNine from "./Student _Sign_up/StepNine";
import GuardianStepNine from "./Guardian_SignUp/GuardianStepNine";

import { 
  handleStudentStep4Submit, 
  handleStudentStep5Submit, 
  handleStudentStep6Submit, 
  handleStudentStep7Submit, 
  handleStudentStep8Submit 
} from "../../components/public/handle_submits/studentHandlers";
import { 
  handleGuardianStep4Submit, 
  handleGuardianStep5Submit, 
  handleGuardianStep6Submit, 
  handleGuardianStep7Submit, 
  handleGuardianStep8Submit 
} from "../../components/public/handle_submits/guardianHandlers";


const SignUp = () => {
  const navigate = useNavigate();
  // mix the text with SESSION_SECRET so it's unique to this window
  const SESSION_KEY = useMemo(() => "TC_SECURE_V1" + Math.random().toString(36).substring(7), []);

  const encrypt = useCallback((data) => {
    try {
      const text = JSON.stringify(data);
      return btoa(`${SESSION_KEY}|${text}`);
    } catch (e) {
      return null;
    }
  }, [SESSION_KEY]);

  const decrypt = useCallback((data) => {
    try {
      if (!data) return null;
      const decoded = atob(data);
      const [key, json] = decoded.split("|");
      if (key !== SESSION_KEY) return null;
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }, [SESSION_KEY]);

  const [step, setStep] = useState(() => {
    return decrypt(sessionStorage.getItem("_tc_step")) || 1;
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [userRole, setUserRole] = useState(() => {
    return decrypt(sessionStorage.getItem("_tc_role")) || null;
  });




  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");





  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [displayPic, setDisplayPic] = useState(null);
  const [biodataErrors, setBiodataErrors] = useState({});
  const [guardianErrors, setGuardianErrors] = useState({});

  // Validation function for biodata
const validateBiodataField = (field, value) => {
  switch (field) {
    case 'firstName':
    case 'lastName':
      if (!value || !value.trim()) {
        return `${field === 'firstName' ? 'First' : 'Last'} name is required`;
      }
      if (value.trim().length < 2) {
        return `${field === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
      }
      return null;

    case 'dob':
      if (!value) {
        return 'Date of birth is required';
      }
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 100) {
        return 'Please enter a valid date of birth';
      }
      return null;

    case 'gender':
      if (!value) {
        return 'Please select your gender';
      }
      return null;

    case 'department':
      if (!value) {
        return 'Please select your department';
      }
      return null;

    case 'location':
      if (!value || !value.trim()) {
        return 'Location is required';
      }
      return null;

    default:
      return null;
  }
};

// Validate all biodata fields
const validateAllBiodataFields = (studentData) => {
  const errors = {};
  const fields = ['firstName', 'lastName', 'dob', 'gender', 'department', 'location'];
  
  fields.forEach(field => {
    const error = validateBiodataField(field, studentData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

  // Step 4 (Guardian Add Student) State
  const [students, setStudents] = useState([
    { firstName: "", lastName: "", identity: "", trainings: ["", "", "", ""] },
  ]);
  const [activeTab, setActiveTab] = useState(0);
  const [studentPassword, setStudentPassword] = useState("");
  const [confirmStudentPassword, setConfirmStudentPassword] = useState("");
  // show/hide toggles for guardian password fields
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showConfirmStudentPassword, setShowConfirmStudentPassword] = useState(false);



  const [selectedExams, setSelectedExams] = useState(["JAMB"]);

  const [examError, setExamError] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which exam is open
  const [selectedSubjects, setSelectedSubjects] = useState({});

  const toggleSubject = (exam, subject) => {
    const current = selectedSubjects[exam] || [];
    const limit = exam === "JAMB" ? 4 : 9;

    if (current.includes(subject)) {
      setSelectedSubjects({
        ...selectedSubjects,
        [exam]: current.filter((s) => s !== subject),
      });
    } else if (current.length < limit) {
      setSelectedSubjects({
        ...selectedSubjects,
        [exam]: [...current, subject],
      });
    }
  };

  const toggleExam = (exam) => {
    setExamError(false);
    if (selectedExams.includes(exam)) {
      setSelectedExams(selectedExams.filter((item) => item !== exam));
    } else {
      setSelectedExams([...selectedExams, exam]);
    }
  };


  const ALL_SUBJECTS = [
    "Mathematics",
    "English",
    "Physics",
    "Biology",
    "Chemistry",
    "Financial Accounting",
    "Economics",
    "French",
    "Literature in English",
    "Commerce",
    "Geography",
    "Government",
    "Agricultural Science",
    "CRS/IRS",
    "Civic",
    "Further Maths",
    "ICT",
    "Technical Drawing",
    "Igbo",
    "Hausa",
    "Yoruba",
  ];

  const [selectedDurations, setSelectedDurations] = useState({});

  const PRICES = {
  JAMB: { Monthly: 3200, Quarterly: 9000, Biannually: 17000, Annually: 32000 },
  WAEC: { Monthly: 4500, Quarterly: 12000, Biannually: 22000, Annually: 38500 },
  NECO: { Monthly: 4000, Quarterly: 11000, Biannually: 20000, Annually: 35000 },
  GCE: { Monthly: 4500, Quarterly: 12000, Biannually: 22000, Annually: 38500 }
};

const DURATIONS = ["Monthly", "Quarterly", "Biannually", "Annually"];

  // Helper to calculate total for student
  const calculateStudentTotal = () => {
    return selectedExams.reduce((acc, exam) => {
      const duration = selectedDurations[exam] || "Monthly";
      return acc + (PRICES[exam]?.[duration] || 0);
    }, 0).toLocaleString();
  };

const [selectedPayment, setSelectedPayment] = useState(null);
  useEffect(() => {
    
    // Every time the brain changes, we lock the new data in the vault
    sessionStorage.setItem("_tc_step", encrypt(step));
    if (userRole) sessionStorage.setItem("_tc_role", encrypt(userRole));
  }, [step, userRole, encrypt]);



  const updateStudent = (index, field, value) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };


  const handleFieldChange = (field, value) => {
    switch(field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'dob': setDob(value); break;
      case 'gender': setGender(value); break;
      case 'department': setDepartment(value); break;
      case 'location': setLocation(value); break;
      case 'address': setAddress(value); break;
      case 'displayPic': setDisplayPic(value); break;
      default: break;
    }
    if (biodataErrors[field]) {
      setBiodataErrors({ ...biodataErrors, [field]: null });
    }
  };

  const addStudent = () => {
    setStudents([...students, { firstName: "", lastName: "", identity: "" }]);
    setActiveTab(students.length);
  };


  if (showSplash) return <SplashScreen />;

  if (step === 1) {
    return (
      <StepOne
        userRole={userRole}
        setUserRole={setUserRole}
        setStep={setStep}
      />
    );
  }

  // INTERCEPT GUARDIAN FLOW
  if (userRole === "guardian") {
    return <ComingSoon onBack={() => {
      setStep(1);
      setUserRole(null); 
    }} />;
  }

  if (step === 2) {
    return (
      <StepTwo
        userRole={userRole}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        setStep={setStep}
      />
    );
  }

  if (step === 3) {
    return (
      <StepThree
        email={email}
        userRole={userRole}
        setStep={setStep}
      />
    );
  }

  if (step === 4) {
    if (userRole === "student") {
      const studentData = { firstName, lastName, dob, gender, department, location, address, displayPic };
      return (
        <StepFour
          studentData={studentData}
          handleFieldChange={handleFieldChange}
          biodataErrors={biodataErrors}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          handleStep4Submit={() => {
            handleStudentStep4Submit({
              userRole,
              studentData: {
                firstName, lastName, dob, gender, department, location, address, displayPic
              },
              validateAllBiodataFields,
              setBiodataErrors,
              setStep
            });
          }}
          setStep={setStep}
        />
      );
    } else {
      return (
        <GuardianStepFour
          students={students}
          setStudents={setStudents}
          updateStudent={updateStudent}
          addStudent={addStudent}
          studentPassword={studentPassword}
          setStudentPassword={setStudentPassword}
          confirmStudentPassword={confirmStudentPassword}
          setConfirmStudentPassword={setConfirmStudentPassword}
          guardianErrors={guardianErrors}
          handleStep4Submit={() => {
            if (userRole === "student") {
              handleStudentStep4Submit({
                userRole,
                studentData: {
                  firstName, lastName, dob, gender, department, location, address, displayPic
                },
                validateAllBiodataFields,
                setBiodataErrors,
                setStep
              });
            } else {
              handleGuardianStep4Submit({
                students,
                studentPassword,
                confirmStudentPassword,
                setGuardianErrors,
                setStep
              });
            }
          }}
          setStep={setStep}
          showStudentPassword={showStudentPassword}
          setShowStudentPassword={setShowStudentPassword}
          showConfirmStudentPassword={showConfirmStudentPassword}
          setShowConfirmStudentPassword={setShowConfirmStudentPassword}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      );
    }
  }
  if (step === 5) {
    return userRole === "student"
      ? (
        <StepFive
          handleStep5Submit={() => {
            handleStudentStep5Submit({ selectedExams, setExamError, setStep });
          }}
          setStep={setStep}
          selectedExams={selectedExams}
          toggleExam={toggleExam}
          examError={examError}
        />
      )
      : (
        <GuardianStepFive
          students={students}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          guardianErrors={guardianErrors}
          updateStudent={updateStudent}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          handleStep5Submit={() => {
            if (userRole === "student") {
              handleStudentStep5Submit({ selectedExams, setExamError, setStep });
            } else {
              handleGuardianStep5Submit({
                students,
                validateAllBiodataFields,
                setGuardianErrors,
                setStep
              });
            }
          }}
          setStep={setStep}
        />
      );
  }
  if (step === 6) {
    return userRole === "student"
      ? (
        <StepSix
          selectedExams={selectedExams}
          selectedSubjects={selectedSubjects}
          toggleSubject={toggleSubject}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          setStep={setStep}
          ALL_SUBJECTS={ALL_SUBJECTS}
        />
      )
      : (
        <GuardianStepSix
          students={students}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setStudents={setStudents}
          handleStep6Submit={() => {
            if (userRole === "student") {
               handleStudentStep6Submit({
                 selectedExams,
                 selectedSubjects,
                 setStep
               });
            } else {
               handleGuardianStep6Submit({ setStep });
            }
          }}
          setStep={setStep}
        />
      );
  }
  if (step === 7) {
    // For Guardian calculation, I need to replicate logic or pass the helper.
    // The previous inline function 'renderGuardianStepSeven' had a 'calculateTotal' function.
    // I should probably hoist that logic or pass it.
    // In SignUp.jsx, 'calculateStudentTotal' exists for student.
    // I should create 'calculateGuardianTotal' in SignUp.jsx to pass down.
    
    // NOTE: I am referencing 'calculateGuardianTotal' below but it doesn't exist yet in the upper scope logic.
    // I will add it as a separate edit or use an inline arrow function if it's simple enough.
    // Actually, I can pass a lambda props.

    const calculateGuardianTotal = () => {
      let total = 0;
      students.forEach(student => {
        if (student.durations && student.trainings) {
          student.trainings.filter(t => t !== "").forEach(exam => {
            const duration = student.durations[exam];
            if (duration && PRICES[exam] && PRICES[exam][duration]) {
              total += PRICES[exam][duration];
            }
          });
        }
      });
      return total.toLocaleString();
    };

    return userRole === "student"
      ? (
        <StepSeven
          selectedExams={selectedExams}
          selectedDurations={selectedDurations}
          setSelectedDurations={setSelectedDurations}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          PRICES={PRICES}
          DURATIONS={DURATIONS}
          handleStep7Submit={() => handleStudentStep7Submit({
            selectedExams,
            selectedDurations,
            PRICES,
            setStep
          })}
          calculateTotal={calculateStudentTotal}
          setStep={setStep}
        />
      )
      : (
        <GuardianStepSeven
          students={students}
          setStudents={setStudents}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          PRICES={PRICES}
          DURATIONS={DURATIONS}
          handleStep7Submit={() => handleGuardianStep7Submit({
            students,
            PRICES,
            setStep
          })}
          calculateTotal={calculateGuardianTotal}
          setStep={setStep}
        />
      );
  }
  if (step === 8) {
    // For Guardian Step 8, we need calculateTotal.
    // Re-use logic or helper.
    const calculateGuardianTotal = () => {
      let total = 0;
      students.forEach(student => {
        if (student.durations && student.trainings) {
          student.trainings.filter(t => t !== "").forEach(exam => {
            const duration = student.durations[exam];
            if (duration && PRICES[exam] && PRICES[exam][duration]) {
              total += PRICES[exam][duration];
            }
          });
        }
      });
      return total.toLocaleString();
    };

    return userRole === "student"
      ? (
        <StepEight
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          handlePaymentSubmit={(method) => handleStudentStep8Submit({
            paymentMethod: method,
            email,
            firstName,
            lastName,
            dob,
            gender,
            department,
            location,
            address,
            displayPic,
            selectedExams,
            selectedDurations,
            selectedSubjects,
            PRICES,
            setStep
          })}
          calculateTotal={calculateStudentTotal} // Value: calculateStudentTotal()
          setStep={setStep}
        />
      )
      : (
        <GuardianStepEight
           selectedPayment={selectedPayment}
           setSelectedPayment={setSelectedPayment}
           handlePaymentSubmit={(method) => handleGuardianStep8Submit({
             paymentMethod: method,
             email,
             students,
             studentPassword,
             PRICES,
             setStep
           })}
           calculateTotal={calculateGuardianTotal}
           setStep={setStep}
        />
      );
  }
  if (step === 9) {
    return userRole === "student"
      ? (
        <StepNine
          selectedExams={selectedExams}
          selectedDurations={selectedDurations}
          navigate={navigate}
        />
      )
      : (
        <GuardianStepNine
          students={students}
          navigate={navigate}
        />
      );
  }

  return null;
};


export default SignUp;

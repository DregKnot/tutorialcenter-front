import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";

export default function TrainingDuration() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [durationSelections, setDurationSelections] = useState({});
  const [error, setError] = useState(false);

  /* ================= LOAD DATA FROM LOCALSTORAGE ================= */
  useEffect(() => {
    // i am looking for this because that's what the previous page saved
    const storedIds = localStorage.getItem("selectedTraining");
    
    if (!storedIds) {
      // If nothing is found, send them back to pick a training
      navigate("/register/student/training/selection");
      return;
    }

    const ids = JSON.parse(storedIds);

    /** * Since we only have IDs, we create temporary objects. 
     * You will change this part sir
     * using these IDs so you don't see "Course 1", "Course 2", etc.
     */
    const formattedTrainings = ids.map((id) => ({
      id: id,
      title: id === 1 ? "JAMB" : id === 2 ? "WAEC" : id === 3 ? "NECO" : id === 4 ? "GCE" : `Course ${id}`,
    }));

    setSelectedTrainings(formattedTrainings);
  }, [navigate]);

  /* ================= TOGGLE SELECTION LOGIC ================= */
  const toggleDuration = (trainingId, duration) => {
    setDurationSelections((prev) => ({
      ...prev,
      [trainingId]: duration,
    }));
  };

  const isSelected = (trainingId, duration) => {
    return durationSelections[trainingId] === duration;
  };

  /* ================= CONTINUE ACTION ================= */
  const handleContinue = () => {
    // Check if every training in the list has a selection in the durationSelections object
    const allSelected = selectedTrainings.every(
      (training) => durationSelections[training.id]
    );

    if (!allSelected) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    // Save the finalized durations
    localStorage.setItem("trainingDurations", JSON.stringify(durationSelections));
    
    console.log("Finalized Selections:", durationSelections);

    navigate("/register/student/payment/selection");
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-[#F4F4F4] font-sans overflow-x-hidden">
      
      {/* IMAGE SECTION */}
      <div className="w-full h-[250px] md:w-1/2 md:h-full relative order-1 md:order-2">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${otp_img_student})` }}
        />
      </div>

      {/* FORM SECTION */}
      <div className="w-full md:w-1/2 h-full flex flex-col px-6 py-10 lg:px-[100px] lg:py-[60px] order-2 md:order-1 overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto my-auto flex flex-col">
          
          {/* HEADER */}
          <div className="relative w-full flex items-center justify-center mb-6 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 p-2 hover:bg-gray-200 rounded-full"
            >
              <img className="w-5 h-5" src={ReturnArrow} alt="Back" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09314F]">
              Training Duration
            </h1>
          </div>

          {/* CARD */}
          <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            
            <p className="text-gray-500 text-xs md:text-sm mb-6 text-center">
              Select your preferred training duration for your examination.
            </p>

            {/* TABLE HEADER */}
            <div className="grid grid-cols-3 gap-4 mb-4 px-2">
              <div className="text-white bg-[#09314F] py-2 px-3 rounded-tl-lg font-bold text-sm">
                Examination
              </div>
              <div className="text-white bg-[#09314F] py-2 px-3 font-bold text-sm text-center">
                Duration
              </div>
              <div className="text-white bg-[#09314F] py-2 px-3 rounded-tr-lg font-bold text-sm text-right">
                Amount
              </div>
            </div>

            {/* TRAINING ROWS */}
            <div className="space-y-6 mb-6">
              {selectedTrainings.map((training) => (
                <div key={training.id} className="border-b border-gray-200 pb-6">
                  <div className="text-sm font-bold text-[#09314F] mb-4">
                    {training.title}
                  </div>

                  {/* DURATION OPTIONS */}
                  <div className="space-y-3">
                    {[
                      { label: "Monthly", value: "monthly", price: "5,000" },
                      { label: "Annually", value: "annually", price: "50,000" },
                    ].map((option) => {
                      const active = isSelected(training.id, option.value);
                      return (
                        <div key={option.value} className="grid grid-cols-3 gap-4 items-center">
                          <div />
                          <button
                            onClick={() => toggleDuration(training.id, option.value)}
                            className={`py-2 px-3 rounded-lg font-bold text-[10px] md:text-xs transition-all border ${
                              active
                                ? "bg-[#76D287] text-white border-[#76D287] shadow-sm"
                                : "bg-white text-[#4B5563] border-gray-300 hover:border-[#09314F]"
                            }`}
                          >
                            {option.label}
                          </button>
                          <div className="text-sm font-semibold text-[#09314F] text-right">
                            ₦{option.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <p className="text-red-500 text-xs font-bold mb-4 text-center">
                Please select a duration for each examination
              </p>
            )}

            {/* CONTINUE BUTTON */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98]"
              } text-white`}
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

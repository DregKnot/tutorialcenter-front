export const handleStudentStep4Submit = ({
    userRole,
    studentData,
    validateAllBiodataFields,
    setBiodataErrors,
    setStep
}) => {
    if (userRole === "student") {
        // Validate student biodata
        const errors = validateAllBiodataFields(studentData);

        if (errors) {
            setBiodataErrors(errors);
            return;
        }

        setBiodataErrors({});
        console.log("Student biodata valid:", studentData);
        setStep(5);
    }
};

export const handleStudentStep5Submit = ({
    selectedExams,
    setExamError,
    setStep
}) => {
    if (selectedExams.length === 0) {
        setExamError(true);
        return;
    }
    setStep(6);
};

export const handleStudentStep6Submit = ({
    selectedExams,
    selectedSubjects,
    setStep
}) => {
    // 1. Check if every selected exam has at least one subject
    const examsWithNoSubjects = selectedExams.filter(
        (exam) => !selectedSubjects[exam] || selectedSubjects[exam].length === 0
    );

    if (examsWithNoSubjects.length > 0) {
        alert(`Please select subjects for: ${examsWithNoSubjects.join(", ")}`);
        return;
    }

    // 2. Optional: Add a check for the minimum (e.g., WAEC usually requires 8-9)
    const incompleteExams = selectedExams.filter((exam) => {
        const count = selectedSubjects[exam]?.length || 0;
        return exam !== 'JAMB' && count < 8; // Adjust minimum as needed
    });

    if (incompleteExams.length > 0) {
        // confirm("Some exams have fewer than 8 subjects. Continue?");
    }

    setStep(7);
};

export const handleStudentStep7Submit = ({
    selectedExams,
    selectedDurations,
    PRICES,
    setStep
}) => {
    // 1. Validate that all selected exams have durations
    const examsWithoutDuration = selectedExams.filter(
        exam => !selectedDurations[exam]
    );

    if (examsWithoutDuration.length > 0) {
        alert(`Please select duration for: ${examsWithoutDuration.join(", ")}`);
        return;
    }

    // 2. Calculate total to verify
    let total = 0;
    selectedExams.forEach(exam => {
        const duration = selectedDurations[exam];
        if (PRICES[exam] && PRICES[exam][duration]) {
            total += PRICES[exam][duration];
        }
    });

    if (total === 0) {
        alert("Unable to calculate total. Please check your selections.");
        return;
    }

    // 3. Log the data (for debugging/API preparation)
    console.log("Student Step 7 Data:", {
        exams: selectedExams,
        durations: selectedDurations,
        total: total
    });

    // 4. Move to payment
    setStep(8);
};

export const handleStudentStep8Submit = ({
    paymentMethod,
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
}) => {
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }

    // 1. Calculate final total
    let total = 0;
    selectedExams.forEach(exam => {
        const duration = selectedDurations[exam];
        if (PRICES[exam] && PRICES[exam][duration]) {
            total += PRICES[exam][duration];
        }
    });

    // 2. Prepare payload for API
    const payload = {
        userRole: "student",
        email: email,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        gender: gender,
        department: department,
        location: location,
        address: address,
        displayPic: displayPic,
        examinations: selectedExams.map(exam => ({
            exam: exam,
            duration: selectedDurations[exam],
            subjects: selectedSubjects[exam] || [],
            price: PRICES[exam]?.[selectedDurations[exam]] || 0
        })),
        totalAmount: total,
        paymentMethod: paymentMethod
    };

    // 3. Log payload (replace with actual API call)
    console.log("Student Final Payload:", payload);

    // 4. Simulate payment processing
    console.log(`Processing ${paymentMethod} payment of ₦${total.toLocaleString()}...`);

    // 5. For now, just move to success screen
    setTimeout(() => {
        setStep(9);
    }, 1000); // Simulate processing delay
};

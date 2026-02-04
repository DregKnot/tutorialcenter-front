export const handleGuardianStep4Submit = ({
    students,
    studentPassword,
    confirmStudentPassword,
    setGuardianErrors,
    setStep
}) => {
    // Validate guardian data
    const errors = {};
    let hasErrors = false;

    // Validate each student
    students.forEach((student, index) => {
        const studentErrors = {};

        if (!student.firstName?.trim()) {
            studentErrors.firstName = 'First name is required';
            hasErrors = true;
        }
        if (!student.lastName?.trim()) {
            studentErrors.lastName = 'Last name is required';
            hasErrors = true;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+?234|0)(70|80|81|90|91)\d{8}$/;

        if (!student.identity?.trim()) {
            studentErrors.identity = 'Email or phone is required';
            hasErrors = true;
        } else if (!emailRegex.test(student.identity) && !phoneRegex.test(student.identity)) {
            studentErrors.identity = 'Invalid email or phone';
            hasErrors = true;
        }

        if (Object.keys(studentErrors).length > 0) {
            errors[`student_${index}`] = studentErrors;
        }
    });

    // Validate passwords
    if (!studentPassword || studentPassword.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        hasErrors = true;
    }
    if (studentPassword !== confirmStudentPassword) {
        errors.passwordMatch = 'Passwords do not match';
        hasErrors = true;
    }

    if (hasErrors) {
        setGuardianErrors(errors);
        return;
    }

    setGuardianErrors({});
    console.log("Guardian data valid");
    setStep(5);
};

export const handleGuardianStep5Submit = ({
    students,
    validateAllBiodataFields,
    setGuardianErrors,
    setStep
}) => {
    // Validate all student biodata
    const errors = {};
    let hasErrors = false;

    students.forEach((student, index) => {
        const studentErrors = validateAllBiodataFields(student);
        if (studentErrors) {
            errors[`student_${index}`] = studentErrors;
            hasErrors = true;
        }
    });

    if (hasErrors) {
        setGuardianErrors(errors);
        return;
    }

    setGuardianErrors({});
    setStep(6);
};

export const handleGuardianStep6Submit = ({
    setStep
}) => {
    // Guardian Step 6 is selection of exams. If needed, validations can be added here.
    // Currently logic just moves to Step 7.
    setStep(7);
};

export const handleGuardianStep7Submit = ({
    students,
    PRICES,
    setStep
}) => {
    // 1. Validate that all students with trainings have durations
    const errors = [];

    students.forEach((student, idx) => {
        const trainings = student.trainings?.filter(t => t !== "") || [];

        if (trainings.length > 0) {
            trainings.forEach(exam => {
                if (!student.durations || !student.durations[exam]) {
                    errors.push(`Student ${idx + 1}: ${exam} needs a duration`);
                }
            });
        }
    });

    if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
    }

    // 2. Calculate total
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

    if (total === 0) {
        alert("Unable to calculate total. Please check your selections.");
        return;
    }

    // 3. Log the data
    console.log("Guardian Step 7 Data:", {
        students: students,
        total: total
    });

    // 4. Move to payment
    setStep(8);
};

export const handleGuardianStep8Submit = ({
    paymentMethod,
    email,
    students,
    studentPassword,
    PRICES,
    setStep
}) => {
    if (!paymentMethod) {
        alert('Please select a payment method');
        return;
    }

    // 1. Calculate final total
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

    // 2. Prepare payload for API
    const payload = {
        userRole: "guardian",
        email: email,
        studentPassword: studentPassword,
        students: students.map((student, idx) => ({
            firstName: student.firstName,
            lastName: student.lastName,
            identity: student.identity,
            examinations: student.trainings?.filter(t => t !== "").map(exam => ({
                exam: exam,
                duration: student.durations?.[exam],
                price: PRICES[exam]?.[student.durations?.[exam]] || 0
            })) || []
        })),
        totalAmount: total,
        paymentMethod: paymentMethod
    };

    // 3. Log payload
    console.log("Guardian Final Payload:", payload);

    // 4. Simulate payment processing
    console.log(`Processing ${paymentMethod} payment of ₦${total.toLocaleString()}...`);

    // 5. Move to success screen
    setTimeout(() => {
        setStep(9);
    }, 1000);
};

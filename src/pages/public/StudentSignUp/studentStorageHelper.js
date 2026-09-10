/**
 * Centralized, defensive storage helper for the Student Sign-Up flow.
 * Normalizes differences between `{ data: student }` and `{ ...student }`
 * payloads, preventing silent failures, state loss, and redirect loops.
 */

const STORAGE_KEYS = {
  STUDENT_DATA: "studentdata",
  STUDENT_EMAIL: "studentEmail",
  STUDENT_TEL: "studentTel",
  STUDENT_BIODATA: "studentBiodata",
  STUDENT_VERIFIED: "studentVerified",
};

/**
 * Retrieve normalized student data from localStorage.
 * Handles both `{ data: { ... } }` and flat `{ ... }` structures.
 */
export const getStudentData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_DATA);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    // Normalize student payload
    const student = parsed.data || parsed.student || parsed;

    return {
      raw: parsed,
      data: student,
      id: student?.id || parsed?.id,
      email: student?.email || parsed?.email || localStorage.getItem(STORAGE_KEYS.STUDENT_EMAIL) || "",
      tel: student?.tel || parsed?.tel || localStorage.getItem(STORAGE_KEYS.STUDENT_TEL) || "",
      firstname: student?.firstname || parsed?.firstname || "",
      surname: student?.surname || parsed?.surname || "",
      department: student?.department || parsed?.department || "Science",
      selectedTraining: parsed.selectedTraining || [],
      selectedSubjects: parsed.selectedSubjects || {},
      selectedDurations: parsed.selectedDurations || {},
      availableTrainings: parsed.availableTrainings || [],
      referral_code: parsed.referral_code || "",
    };
  } catch (error) {
    console.warn("[studentStorageHelper] Failed to read student data:", error);
    return null;
  }
};

/**
 * Safely resolves the student's department with resilient fallbacks.
 */
export const getStudentDepartment = () => {
  const current = getStudentData();
  if (current?.department && typeof current.department === "string" && current.department.trim()) {
    return current.department.trim();
  }

  // Fallback checks from other cached stores
  try {
    const biodata = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENT_BIODATA) || "{}");
    if (biodata?.department) return biodata.department.trim();
  } catch {
    // Ignore parse error
  }

  return "Science"; // Sensible default in the educational curriculum
};

/**
 * Atomically updates the student data in localStorage without losing existing keys.
 */
export const updateStudentData = (updates = {}) => {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.STUDENT_DATA);
    let base = {};

    if (existingRaw) {
      try {
        base = JSON.parse(existingRaw) || {};
      } catch {
        base = {};
      }
    }

    // Preserve the inner `data` object structure if present
    const updatedData = {
      ...base,
      ...updates,
      data: {
        ...(base.data || {}),
        ...(updates.data || {}),
      },
    };

    // If root properties like selectedTraining are provided, ensure they don't get wiped
    if (updates.selectedTraining !== undefined) {
      updatedData.selectedTraining = updates.selectedTraining;
    }
    if (updates.selectedSubjects !== undefined) {
      updatedData.selectedSubjects = updates.selectedSubjects;
    }
    if (updates.selectedDurations !== undefined) {
      updatedData.selectedDurations = updates.selectedDurations;
    }
    if (updates.availableTrainings !== undefined) {
      updatedData.availableTrainings = updates.availableTrainings;
    }
    if (updates.referral_code !== undefined) {
      updatedData.referral_code = updates.referral_code;
    }

    localStorage.setItem(STORAGE_KEYS.STUDENT_DATA, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error("[studentStorageHelper] Failed to update student data:", error);
    return null;
  }
};

/**
 * Clears registration-specific caches while leaving unrelated storage intact.
 */
export const clearStudentRegistrationData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};

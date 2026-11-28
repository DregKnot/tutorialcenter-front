/**
 * Shared helpers for extracting assigned Lead Tutors and Course Advisors
 * from Master Class and Class Session payloads.
 */

const ASSISTANT_OR_OBSERVER_KEYWORDS = [
  "assistant",
  "advisor",
  "coordinator",
  "coo",
  "admin",
  "superadmin",
  "super_admin",
  "csa",
  "moderator",
  "operations",
  "preview",
];

const unwrapStaff = (entry) => (entry && typeof entry === "object" ? entry.staff || entry : null);

export const formatStaffName = (entry, fallback = "Unassigned") => {
  const s = unwrapStaff(entry);
  if (!s) return fallback;
  const firstName = String(s.firstname || s.first_name || "").trim();
  const lastName = String(s.surname || s.last_name || "").trim();
  if (firstName && lastName) return `${firstName} ${lastName}`;
  const combined = `${firstName} ${lastName}`.trim();
  return String(s.name || combined || fallback).trim() || fallback;
};

export const getStaffInitials = (name, fallback = "TC") => {
  if (!name || typeof name !== "string") return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || fallback;
};

export const isAssistantOrAdvisorStaff = (entry) => {
  if (!entry || typeof entry !== "object") return false;
  const pivotRole = String(entry.pivot?.role || "").toLowerCase().trim();

  if (pivotRole === "lead" || pivotRole === "tutor") return false;
  if (
    pivotRole.includes("assistant") ||
    pivotRole.includes("advisor") ||
    pivotRole.includes("coordinator")
  ) {
    return true;
  }

  const accountRole = String(
    entry.role || entry.staff?.role || entry.staff_role || ""
  )
    .toLowerCase()
    .trim();

  if (!accountRole) return false;
  if (accountRole === "tutor") return false;

  return ASSISTANT_OR_OBSERVER_KEYWORDS.some((kw) => accountRole.includes(kw));
};

const toStaffProfile = (entry, roleLabel = "Lead Tutor") => {
  const s = unwrapStaff(entry) || {};
  const name = formatStaffName(entry, "Assigned Tutor");
  return {
    id: s.id || entry?.staff_id || entry?.id || null,
    name,
    email: s.email || "tutor@tutorialcenter.africa",
    phone: s.phone || s.phone_number || s.tel || "Not provided",
    role: roleLabel,
    avatar: s.profile_picture || s.avatar || null,
    initials: getStaffInitials(name, "T"),
  };
};

/**
 * Extracts Lead Tutor and Advisor profiles from one or more payload objects
 * (e.g., session and its parent class), prioritizing pivot.role === "lead"
 * and real tutor accounts over assistant/advisor/COO records.
 */
export const extractClassStaffInfo = (...sources) => {
  const validSources = sources.filter((src) => src && typeof src === "object");

  const allStaffEntries = [];
  for (const src of validSources) {
    if (Array.isArray(src.staffs)) {
      allStaffEntries.push(...src.staffs);
    }
  }

  const advisors = allStaffEntries
    .filter((entry) => {
      const pivotRole = String(entry?.pivot?.role || "").toLowerCase().trim();
      const accountRole = String(entry?.role || entry?.staff?.role || "").toLowerCase().trim();
      return (
        pivotRole.includes("assistant") ||
        pivotRole.includes("advisor") ||
        accountRole.includes("advisor")
      );
    })
    .map((entry) => toStaffProfile(entry, "Course Advisor"));

  // 1. Explicit pivot.role === "lead" (ignoring assistants/advisors)
  const leadByPivot = allStaffEntries.find((entry) => {
    const pivotRole = String(entry?.pivot?.role || "").toLowerCase().trim();
    return pivotRole === "lead" && !isAssistantOrAdvisorStaff(entry);
  });
  if (leadByPivot) {
    return { tutor: toStaffProfile(leadByPivot, "Lead Tutor"), advisors };
  }

  // 2. Any entry with account role === "tutor" (or non-assistant/non-observer)
  const leadByTutorRole = allStaffEntries.find((entry) => {
    const accountRole = String(entry?.role || entry?.staff?.role || "").toLowerCase().trim();
    return accountRole === "tutor" && !isAssistantOrAdvisorStaff(entry);
  });
  if (leadByTutorRole) {
    return { tutor: toStaffProfile(leadByTutorRole, "Lead Tutor"), advisors };
  }

  const firstNonAdvisor = allStaffEntries.find((entry) => !isAssistantOrAdvisorStaff(entry));
  if (firstNonAdvisor) {
    const pivotRole = String(firstNonAdvisor?.pivot?.role || "").trim();
    const roleLabel = pivotRole
      ? `${pivotRole.charAt(0).toUpperCase() + pivotRole.slice(1)} Tutor`
      : "Lead Tutor";
    return { tutor: toStaffProfile(firstNonAdvisor, roleLabel), advisors };
  }

  // 3. Dedicated tutors array or tutor object on session/class
  for (const src of validSources) {
    if (Array.isArray(src.tutors) && src.tutors.length > 0) {
      return { tutor: toStaffProfile(src.tutors[0], "Master Class Tutor"), advisors };
    }
    if (src.tutor && typeof src.tutor === "object") {
      return { tutor: toStaffProfile(src.tutor, "Lead Tutor"), advisors };
    }
    if (src.tutor_name && typeof src.tutor_name === "string") {
      const name = src.tutor_name.trim();
      return {
        tutor: {
          id: src.tutor_id || null,
          name,
          email: src.tutor_email || "tutor@tutorialcenter.africa",
          phone: "Not provided",
          role: "Tutor",
          avatar: null,
          initials: getStaffInitials(name, "T"),
        },
        advisors,
      };
    }
  }

  return {
    tutor: {
      id: null,
      name: "Tutorial Center Tutor",
      email: "support@tutorialcenter.africa",
      phone: "Not provided",
      role: "Faculty Tutor",
      avatar: null,
      initials: "TC",
    },
    advisors,
  };
};

export const getLeadTutorName = (cls, fallback = "Unassigned") => {
  if (!cls) return fallback;
  const { tutor } = extractClassStaffInfo(cls);
  if (!tutor?.name || tutor.name === "Tutorial Center Tutor") {
    return fallback;
  }
  return tutor.name;
};

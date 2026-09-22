export const READ_ONLY_ROLES = [
  "coo",
  "preview",
  "operations",
  "csa",
  "customer support",
  "customer_support",
  "customer-support"
];

/**
 * Checks if a given staff role (or the currently stored staff role) is read-only.
 * Read-only roles have executive inspection rights across admin pages but cannot mutate data.
 *
 * @param {string} [role] - Optional role string. If omitted, reads from localStorage.
 * @returns {boolean}
 */
export const isReadOnlyStaff = (role) => {
  const targetRole = (role !== undefined && role !== null ? role : localStorage.getItem("staff_role") || "")
    .toLowerCase()
    .trim();
  return READ_ONLY_ROLES.includes(targetRole);
};

/**
 * Checks if a given staff role is specifically CSA / Customer Support.
 *
 * @param {string} [role] - Optional role string. If omitted, reads from localStorage.
 * @returns {boolean}
 */
export const isCsa = (role) => {
  const targetRole = (role !== undefined && role !== null ? role : localStorage.getItem("staff_role") || "")
    .toLowerCase()
    .trim();
  return ["csa", "customer support", "customer_support", "customer-support"].includes(targetRole);
};

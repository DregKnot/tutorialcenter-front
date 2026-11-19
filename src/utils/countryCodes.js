/**
 * Supported African & International Country Calling Codes
 * Default: Nigeria (+234), Cameroon (+237), and other prominent regional partners.
 */
export const AFRICAN_COUNTRY_CODES = [
  { code: "+234", country: "Nigeria", flag: "🇳🇬", iso: "NG", placeholder: "8012345678", minLength: 10, maxLength: 11 },
  { code: "+237", country: "Cameroon", flag: "🇨🇲", iso: "CM", placeholder: "671234567", minLength: 9, maxLength: 9 },
  { code: "+233", country: "Ghana", flag: "🇬🇭", iso: "GH", placeholder: "241234567", minLength: 9, maxLength: 10 },
  { code: "+254", country: "Kenya", flag: "🇰🇪", iso: "KE", placeholder: "712345678", minLength: 9, maxLength: 10 },
  { code: "+27", country: "South Africa", flag: "🇿🇦", iso: "ZA", placeholder: "821234567", minLength: 9, maxLength: 10 },
  { code: "+250", country: "Rwanda", flag: "🇷🇼", iso: "RW", placeholder: "781234567", minLength: 9, maxLength: 9 },
  { code: "+256", country: "Uganda", flag: "🇺🇬", iso: "UG", placeholder: "712345678", minLength: 9, maxLength: 9 },
  { code: "+255", country: "Tanzania", flag: "🇹🇿", iso: "TZ", placeholder: "712345678", minLength: 9, maxLength: 9 },
  { code: "+232", country: "Sierra Leone", flag: "🇸🇱", iso: "SL", placeholder: "76123456", minLength: 8, maxLength: 8 },
  { code: "+231", country: "Liberia", flag: "🇱🇷", iso: "LR", placeholder: "77123456", minLength: 7, maxLength: 8 },
  { code: "+220", country: "Gambia", flag: "🇬🇲", iso: "GM", placeholder: "7012345", minLength: 7, maxLength: 7 },
  { code: "+229", country: "Benin", flag: "🇧🇯", iso: "BJ", placeholder: "97123456", minLength: 8, maxLength: 8 },
  { code: "+228", country: "Togo", flag: "🇹🇬", iso: "TG", placeholder: "90123456", minLength: 8, maxLength: 8 },
  { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮", iso: "CI", placeholder: "0712345678", minLength: 8, maxLength: 10 },
  { code: "+221", country: "Senegal", flag: "🇸🇳", iso: "SN", placeholder: "771234567", minLength: 9, maxLength: 9 },
  { code: "+260", country: "Zambia", flag: "🇿🇲", iso: "ZM", placeholder: "971234567", minLength: 9, maxLength: 9 },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼", iso: "ZW", placeholder: "771234567", minLength: 9, maxLength: 9 },
  { code: "+20", country: "Egypt", flag: "🇪🇬", iso: "EG", placeholder: "1012345678", minLength: 10, maxLength: 10 },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", iso: "GB", placeholder: "7911123456", minLength: 10, maxLength: 10 },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸", iso: "US", placeholder: "5551234567", minLength: 10, maxLength: 10 },
];

/**
 * Normalizes phone number into international E.164 format with country code.
 * Strips leading zero from local numbers if country code is selected.
 *
 * @param {string} countryCode E.g. "+237" or "+234"
 * @param {string} localNumber E.g. "671234567" or "08012345678"
 * @returns {string} E.164 formatted string like "+237671234567"
 */
export const formatPhoneWithCountryCode = (countryCode = "+234", localNumber = "") => {
  if (!localNumber) return "";
  const trimmed = String(localNumber).trim();
  if (!trimmed) return "";

  // If user already typed leading +, preserve it cleanly
  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  // Check if user already typed the country code without plus (e.g. 237671234567)
  const cleanCode = countryCode.replace("+", "");
  if (trimmed.startsWith(cleanCode) && trimmed.length > cleanCode.length + 5) {
    return `+${trimmed}`;
  }

  // Strip leading 0 from local number (e.g. 080... -> 80..., 069... -> 69...)
  let cleanLocal = trimmed;
  if (cleanLocal.startsWith("0")) {
    cleanLocal = cleanLocal.substring(1);
  }

  return `${countryCode}${cleanLocal}`;
};

/**
 * Extracts country code and local number from an existing phone string.
 *
 * @param {string} fullPhone E.g. "+237671234567" or "08012345678"
 * @returns {{ countryCode: string, localNumber: string }}
 */
export const parsePhoneAndCountryCode = (fullPhone = "") => {
  if (!fullPhone) return { countryCode: "+234", localNumber: "" };
  const trimmed = String(fullPhone).trim();

  // Sort country codes by length descending so +234, +237 match before +27
  const sorted = [...AFRICAN_COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);

  for (const c of sorted) {
    if (trimmed.startsWith(c.code)) {
      return {
        countryCode: c.code,
        localNumber: trimmed.slice(c.code.length),
      };
    }
    const cleanCode = c.code.replace("+", "");
    if (trimmed.startsWith(cleanCode) && trimmed.length >= cleanCode.length + 7) {
      return {
        countryCode: c.code,
        localNumber: trimmed.slice(cleanCode.length),
      };
    }
  }

  // Default to Nigeria +234
  return {
    countryCode: "+234",
    localNumber: trimmed.startsWith("0") ? trimmed.slice(1) : trimmed,
  };
};

/**
 * Validates international phone number length and format.
 *
 * @param {string} countryCode
 * @param {string} localNumber
 * @returns {boolean}
 */
export const isValidPhoneNumber = (countryCode, localNumber) => {
  if (!localNumber || !String(localNumber).trim()) return false;
  const digits = String(localNumber).replace(/[^0-9]/g, "");
  // An international phone local part typically has 7 to 13 digits
  return digits.length >= 7 && digits.length <= 14;
};

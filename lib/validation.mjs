export const countries = [
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "Not sure yet",
];
export const qualifications = [
  "Secondary school",
  "12th / Intermediate",
  "Diploma",
  "Bachelor’s degree",
  "Master’s degree",
  "Other",
];
export function validateEnquiry(input) {
  const errors = {};
  const data = {};
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { errors: { form: "Please provide your enquiry details." } };
  for (const [key, max] of Object.entries({
    fullName: 100,
    phone: 24,
    email: 254,
    destination: 40,
    qualification: 60,
    intake: 60,
    message: 1000,
    website: 200,
    turnstileToken: 2048,
  })) {
    if (input[key] !== undefined && typeof input[key] !== "string") {
      errors[key] = "Please enter text.";
      continue;
    }
    data[key] = (input[key] || "").trim();
    if (data[key].length > max)
      errors[key] = `Please use ${max} characters or fewer.`;
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(data[key]))
      errors[key] = "Please remove invalid characters.";
  }
  if (!data.fullName || data.fullName.length < 2)
    errors.fullName = "Please enter your full name.";
  if (
    !/^\+[1-9][\d ()-]{6,23}$/.test(data.phone || "") ||
    (data.phone || "").replace(/\D/g, "").length > 15 ||
    (data.phone || "").replace(/\D/g, "").length < 7
  )
    errors.phone =
      "Include a valid number and country code, such as +91 98765 43210.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Please enter a valid email address.";
  if (!countries.includes(data.destination))
    errors.destination = "Please choose a destination.";
  if (!qualifications.includes(data.qualification))
    errors.qualification = "Please choose your highest qualification.";
  if (input.privacy !== true)
    errors.privacy = "Please acknowledge the Privacy Policy.";
  if (input.marketing !== undefined && typeof input.marketing !== "boolean")
    errors.marketing = "Please choose whether to receive updates.";
  data.privacy = input.privacy === true;
  data.marketing = input.marketing === true;
  const attribution = {};
  if (
    input.adsConsent === true &&
    input.attribution &&
    typeof input.attribution === "object" &&
    !Array.isArray(input.attribution)
  ) {
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "gbraid",
      "wbraid",
    ]) {
      const value = input.attribution[key];
      // Keep identifiers only: never free-form text, URLs or email addresses.
      if (typeof value === "string" && /^[A-Za-z0-9_.~-]{1,150}$/.test(value))
        attribution[key] = value;
    }
  }
  data.adsConsent = input.adsConsent === true;
  data.attribution = attribution;
  return { data, errors };
}

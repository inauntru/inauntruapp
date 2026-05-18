import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Until domain is verified with Resend, use onboarding@resend.dev for testing.
// After verification: change to "INAUNTRU <hello@inauntru.ro>"
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "INAUNTRU <onboarding@resend.dev>";

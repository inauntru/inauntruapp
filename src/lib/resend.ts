import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Until domain is verified with Resend, use onboarding@resend.dev for testing.
// After verification: change to "WithIn <hello@within.ro>"
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "WithIn <onboarding@resend.dev>";

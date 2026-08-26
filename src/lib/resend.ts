import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Domeniul withinapp.ro e verificat în Resend; expeditorul vine din env.
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "WithIn <onboarding@resend.dev>";

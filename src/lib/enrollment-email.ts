import { supabase } from "@/lib/supabase";
import type { Lead } from "@/lib/leads";

interface EnrollmentEmailInput {
  lead: Lead;
  rollNumber: string;
}

export async function sendEnrollmentConfirmationEmail({
  lead,
  rollNumber,
}: EnrollmentEmailInput): Promise<{ sent: boolean }> {
  if (!supabase) {
    return { sent: false };
  }

  const { error } = await supabase.functions.invoke("send-enrollment-confirmation", {
    body: {
      email: lead.email,
      name: lead.name,
      rollNumber,
    },
  });

  if (error) {
    throw error;
  }

  return { sent: true };
}

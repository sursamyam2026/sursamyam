import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EnrollmentEmailPayload {
  email?: unknown;
  name?: unknown;
  rollNumber?: unknown;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char] ?? char;
  });
}

async function assertAdmin(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey || !authorization) {
    return false;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authorization },
    },
  });

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) {
    return false;
  }

  const { data: admin, error: adminError } = await client
    .from("admin_users")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();

  return !adminError && Boolean(admin);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!(await assertAdmin(req))) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("ENROLLMENT_FROM_EMAIL");
  const replyTo = Deno.env.get("ENROLLMENT_REPLY_TO");

  if (!resendApiKey || !fromEmail) {
    return jsonResponse({ error: "Email service is not configured" }, 500);
  }

  let payload: EnrollmentEmailPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const rollNumber = typeof payload.rollNumber === "string" ? payload.rollNumber.trim() : "";

  if (!email || !isEmail(email) || !name || !rollNumber) {
    return jsonResponse({ error: "Email, name, and roll number are required" }, 400);
  }

  const safeName = escapeHtml(name);
  const safeRollNumber = escapeHtml(rollNumber);
  const subject = "Enrollment Confirmed - Sur Samyam";
  const text = [
    `Dear ${name},`,
    "",
    "Your enrollment with Sur Samyam has been confirmed.",
    "",
    `Assigned roll number: ${rollNumber}`,
    "",
    "Please keep this roll number for future fee payments, attendance, and exam registrations.",
    "",
    "Warm regards,",
    "Sur Samyam",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #1B4D3E; line-height: 1.6;">
      <p>Dear ${safeName},</p>
      <p>Your enrollment with <strong>Sur Samyam</strong> has been confirmed.</p>
      <p>
        <strong>Assigned roll number:</strong>
        <span style="color: #C9922A;">${safeRollNumber}</span>
      </p>
      <p>Please keep this roll number for future fee payments, attendance, and exam registrations.</p>
      <p>Warm regards,<br />Sur Samyam</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return jsonResponse({ error: "Unable to send email", details }, 502);
  }

  return jsonResponse({ ok: true });
});

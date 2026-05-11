import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function paragraphToHtml(value: string) {
  return value
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

async function sendEmail(input: { to?: string | null; subject: string; text: string }) {
  if (!input.to) return { sent: false, reason: "missing_recipient" };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Alex from Spine Empire <alex@spineempire.com>";

  if (!apiKey || !from) {
    console.warn("[lead-claimed] Resend is not configured, skipping email");
    return { sent: false, reason: "missing_resend_config" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: paragraphToHtml(input.text),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend email failed with status ${response.status}${body ? `: ${body}` : ""}`);
  }

  return { sent: true };
}

function buildSetterClaimCopy(input: {
  leadName: string;
  practiceName?: string | null;
  summary?: string | null;
  leadUrl: string;
}) {
  const subject = `Lead claimed: ${input.practiceName || input.leadName}`;
  const text = [
    "Lead claimed.",
    "",
    `Lead: ${input.leadName}`,
    input.practiceName ? `Practice: ${input.practiceName}` : "",
    input.summary ? `Summary:\n${input.summary}` : "",
    `Open lead: ${input.leadUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, text };
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const { leadId } = (await request.json()) as { leadId?: string };

    if (!token || !leadId) {
      return NextResponse.json({ error: "Missing token or leadId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.user.id;
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id,business_name,contact_name,email,phone,setter_id,metadata")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError) throw leadError;
    if (!lead || lead.setter_id !== userId) {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_owner" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,notification_email_enabled,notification_in_app_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    const leadUrl = `${process.env.NEXT_PUBLIC_SETTER_TERMINAL_URL || "https://setter.spineempire.com"}/?lead=${encodeURIComponent(leadId)}`;
    const copy = buildSetterClaimCopy({
      leadName: lead.contact_name || lead.email || "Unknown lead",
      practiceName: lead.business_name,
      summary:
        typeof lead.metadata?.imported_intake_summary === "string"
          ? lead.metadata.imported_intake_summary
          : null,
      leadUrl,
    });

    const operations: Array<Promise<unknown>> = [];

    if (profile?.notification_email_enabled !== false) {
      operations.push(sendEmail({ to: profile?.email, subject: copy.subject, text: copy.text }));
    }

    if (profile?.notification_in_app_enabled !== false) {
      operations.push(
        Promise.resolve(
          supabase.from("notifications").insert({
            recipient_id: userId,
            kind: "lead_claimed",
            title: "Lead claimed",
            body: `${lead.contact_name || lead.email || "A lead"} is now in your queue.`,
            action_url: leadUrl,
            metadata: {
              lead_id: leadId,
              source: "setter_claim",
            },
          }),
        ).then(({ error }) => {
          if (error) throw error;
        }),
      );
    }

    const settled = await Promise.allSettled(operations);
    settled
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .forEach((result) => console.error("[lead-claimed] notification failed", result.reason));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[lead-claimed] route failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY || "re_5knakEui_85LWoTRmwj77oKUUgQtA2xsY";
    const toEmail = process.env.CONTACT_EMAIL || "shashibhushan27072002@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "proofStack Contact <onboarding@resend.dev>";


    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[proofStack Contact] ${subject || `New message from ${name}`}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
            <div style="background: linear-gradient(90deg, #06b6d4, #4f46e5); padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px;">proofStack Contact Inquiry</h1>
            </div>
            
            <div style="padding: 32px;">
              <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #1e293b;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #94a3b8;"><strong style="color: #cbd5e1;">From:</strong> ${name}</p>
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #94a3b8;"><strong style="color: #cbd5e1;">Email:</strong> <a href="mailto:${email}" style="color: #22d3ee; text-decoration: none;">${email}</a></p>
                <p style="margin: 0; font-size: 14px; color: #94a3b8;"><strong style="color: #cbd5e1;">Subject:</strong> ${subject || "N/A"}</p>
              </div>

              <div style="margin-top: 16px;">
                <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #06b6d4;">Message Content</h3>
                <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; font-size: 15px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${message}</div>
              </div>
            </div>

            <div style="background-color: #020617; padding: 16px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b;">
              Sent via proofStack Contact Portal • Haridwar, India
            </div>
          </div>
        `,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API Error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to deliver message via Resend." },
        { status: resendResponse.status }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: unknown) {
    console.error("Contact API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing message." },
      { status: 500 }
    );
  }
}


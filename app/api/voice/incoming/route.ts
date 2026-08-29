import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { validateTwilioSignature } from "@/lib/twilioAuth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  const signature = request.headers.get("x-twilio-signature");
  if (!validateTwilioSignature(request.url, params, signature)) {
    return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 403 });
  }

  const twiml = new twilio.twiml.VoiceResponse();
  const gather = twiml.gather({
    input: ["speech"],
    action: "/api/voice/respond",
    method: "POST",
    speechTimeout: "auto",
  });
  gather.say(
    { voice: "Polly.Matthew" },
    "Thanks for calling Apex Plumbing and Heating. This is Ring. What's going on?"
  );

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

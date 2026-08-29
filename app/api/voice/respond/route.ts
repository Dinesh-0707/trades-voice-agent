import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma } from "@/lib/prisma";
import { runAgentTurn, type AgentMessage } from "@/lib/agent";
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

  const callSid = params.CallSid ?? "unknown";
  const speechResult = params.SpeechResult ?? "";
  const sessionId = `voice_${callSid}`;

  const twiml = new twilio.twiml.VoiceResponse();

  if (!speechResult) {
    twiml.say({ voice: "Polly.Matthew" }, "I didn't catch that. Thanks for calling, goodbye.");
    twiml.hangup();
    return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
  }

  await prisma.message.create({
    data: { sessionId, channel: "VOICE", role: "USER", content: speechResult },
  });

  const priorMessages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const history: AgentMessage[] = priorMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  const { reply } = await runAgentTurn(history, sessionId, "VOICE");

  await prisma.message.create({
    data: { sessionId, channel: "VOICE", role: "ASSISTANT", content: reply },
  });

  const gather = twiml.gather({
    input: ["speech"],
    action: "/api/voice/respond",
    method: "POST",
    speechTimeout: "auto",
  });
  gather.say({ voice: "Polly.Matthew" }, reply);

  return new NextResponse(twiml.toString(), { headers: { "Content-Type": "text/xml" } });
}

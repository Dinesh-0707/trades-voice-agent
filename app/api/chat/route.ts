import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runAgentTurn, type AgentMessage } from "@/lib/agent";

export async function POST(request: NextRequest) {
  const { sessionId, message } = (await request.json()) as {
    sessionId: string;
    message: string;
  };

  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId and message are required" }, { status: 400 });
  }

  await prisma.message.create({
    data: { sessionId, channel: "CHAT", role: "USER", content: message },
  });

  const priorMessages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const history: AgentMessage[] = priorMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  const { reply } = await runAgentTurn(history, sessionId, "CHAT");

  await prisma.message.create({
    data: { sessionId, channel: "CHAT", role: "ASSISTANT", content: reply },
  });

  const job = await prisma.job.findUnique({
    where: { sessionId },
    include: { customer: true, technician: true },
  });

  return NextResponse.json({ reply, job });
}

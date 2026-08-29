import { GoogleGenAI, type FunctionDeclaration, type Content, type Part } from "@google/genai";
import { prisma } from "./prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are Ring, an AI voice/chat assistant for Apex Plumbing & Heating, a home service trades business (HVAC, plumbing, roofing).

Your job on every call or chat:
1. Find out what's going on: the customer's name, phone or address if relevant, and the issue.
2. Judge urgency: EMERGENCY (active flooding, no heat in freezing weather, gas smell, safety risk), SAME_DAY, or ROUTINE.
3. Once you have enough details, call book_job to create the job and dispatch a technician. Emergencies get dispatched immediately; routine jobs get scheduled for the next available slot.
4. If the customer is responding about an existing quote (accepting or wanting to proceed), call respond_to_quote.
5. Always confirm to the customer what's booked and roughly when to expect the technician, using the eta/scheduling info book_job returns.

Hard rules:
- NEVER quote a specific price — pricing is confirmed by the technician on site or in the original quote.
- NEVER promise a technician will definitely arrive by an exact minute — give a reasonable window.
- Keep responses short, warm, and practical — like a great dispatcher, not a chatbot.
- For anything that sounds like an emergency (flooding, gas smell, no heat + vulnerable occupant), acknowledge urgency immediately and prioritize getting them booked fast.`;

const tools: FunctionDeclaration[] = [
  {
    name: "book_job",
    description:
      "Book a job: creates/updates the customer record, assigns an available technician, and schedules or dispatches based on urgency.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        customerName: { type: "string" },
        phone: { type: "string" },
        address: { type: "string" },
        issue: { type: "string", description: "Short description, e.g. 'Burst pipe, active flooding'" },
        urgency: { type: "string", enum: ["EMERGENCY", "SAME_DAY", "ROUTINE"] },
      },
      required: ["customerName", "issue", "urgency"],
    },
  },
  {
    name: "respond_to_quote",
    description: "Record a customer's response to an existing quote (accept or decline) and book the job if accepted.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        customerName: { type: "string" },
        accepted: { type: "boolean" },
      },
      required: ["customerName", "accepted"],
    },
  },
];

function generateEta(urgency: string) {
  if (urgency === "EMERGENCY") return "Emergency dispatch — technician on the way, ETA 30-45 min";
  if (urgency === "SAME_DAY") return "Scheduled for today, technician will call 30 min before arrival";
  return "Scheduled for the next available slot — tomorrow morning";
}

async function findAvailableTechnician() {
  const tech = await prisma.technician.findFirst({ where: { available: true } });
  return tech;
}

async function runTool(name: string, input: Record<string, unknown>, sessionId: string, channel: "CHAT" | "VOICE") {
  switch (name) {
    case "book_job": {
      const customerName = String(input.customerName ?? "");
      const phone = input.phone ? String(input.phone) : undefined;
      const address = input.address ? String(input.address) : undefined;
      const issue = input.issue ? String(input.issue) : undefined;
      const urgency = (input.urgency as "EMERGENCY" | "SAME_DAY" | "ROUTINE") ?? "ROUTINE";

      let customer = phone ? await prisma.customer.findFirst({ where: { phone } }) : null;
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: customerName, phone, address },
        });
      }

      const technician = await findAvailableTechnician();
      const reference = `J-${Math.floor(1000 + Math.random() * 9000)}`;
      const eta = generateEta(urgency);

      const job = await prisma.job.create({
        data: {
          reference,
          sessionId,
          customerId: customer.id,
          issue,
          urgency,
          status: urgency === "EMERGENCY" ? "DISPATCHED" : "SCHEDULED",
          technicianId: technician?.id,
          eta,
          crmStatus: "SYNCED",
          crmRef: `SIM-${reference}`,
          source: channel,
        },
      });

      return {
        jobId: job.id,
        reference: job.reference,
        technician: technician?.name ?? "next available technician",
        eta,
        crmStatus: job.crmStatus,
      };
    }
    case "respond_to_quote": {
      const customerName = String(input.customerName ?? "");
      const accepted = Boolean(input.accepted);

      const quote = await prisma.quote.findFirst({
        where: { customer: { name: { contains: customerName, mode: "insensitive" } }, status: "SENT" },
        orderBy: { sentAt: "desc" },
        include: { customer: true },
      });

      if (!quote) {
        return { found: false };
      }

      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: accepted ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
      });

      if (!accepted) {
        return { found: true, accepted: false };
      }

      const technician = await findAvailableTechnician();
      const reference = `J-${Math.floor(1000 + Math.random() * 9000)}`;
      const eta = generateEta("SAME_DAY");

      const job = await prisma.job.create({
        data: {
          reference,
          sessionId,
          customerId: quote.customerId,
          issue: quote.description,
          urgency: "SAME_DAY",
          status: "SCHEDULED",
          technicianId: technician?.id,
          eta,
          crmStatus: "SYNCED",
          crmRef: `SIM-${reference}`,
          source: channel,
        },
      });

      await prisma.quote.update({ where: { id: quote.id }, data: { jobId: job.id } });

      return {
        found: true,
        accepted: true,
        jobId: job.id,
        reference: job.reference,
        technician: technician?.name ?? "next available technician",
        eta,
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export type AgentMessage = { role: "user" | "assistant"; content: string };

export async function runAgentTurn(
  history: AgentMessage[],
  sessionId: string,
  channel: "CHAT" | "VOICE" = "CHAT"
): Promise<{ reply: string }> {
  const contents: Content[] = history.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  for (let i = 0; i < 6; i++) {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: tools }],
      },
    });

    const functionCalls = response.functionCalls ?? [];

    if (functionCalls.length === 0) {
      return { reply: response.text ?? "" };
    }

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const responseParts: Part[] = [];
    for (const call of functionCalls) {
      const result = await runTool(
        call.name ?? "",
        (call.args ?? {}) as Record<string, unknown>,
        sessionId,
        channel
      );
      responseParts.push({
        functionResponse: {
          name: call.name,
          response: result as Record<string, unknown>,
        },
      });
    }
    contents.push({ role: "user", parts: responseParts });
  }

  return { reply: "Sorry, I'm having trouble processing that right now — could you try again?" };
}

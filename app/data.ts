export type Speaker = "caller" | "agent" | "system";

export type DashboardPatch = Partial<{
  customer: string;
  phone: string;
  issue: string;
  urgency: string;
  slot: string;
  crm: string;
  note: string;
}>;

export type ScriptLine = {
  speaker: Speaker;
  text: string;
  patch?: DashboardPatch;
};

export type Scenario = {
  id: string;
  label: string;
  tagline: string;
  crmName: string;
  lines: ScriptLine[];
};

export const scenarios: Scenario[] = [
  {
    id: "emergency",
    label: "After-hours emergency",
    tagline: "9:47 PM · Inbound call · Apex Plumbing & Heating",
    crmName: "ServiceTitan",
    lines: [
      {
        speaker: "system",
        text: "Incoming call — after hours. No human available.",
      },
      {
        speaker: "agent",
        text: "Thanks for calling Apex Plumbing & Heating, this is Ring. What's going on tonight?",
      },
      {
        speaker: "caller",
        text: "Hi — a pipe just burst in my basement, it's flooding fast!",
        patch: { issue: "Burst pipe, active flooding", urgency: "EMERGENCY" },
      },
      {
        speaker: "agent",
        text: "That's an emergency, I'm flagging it as urgent right now. Can I get your name and address?",
      },
      {
        speaker: "caller",
        text: "Sarah Whitfield, 214 Maple Ave.",
        patch: { customer: "Sarah Whitfield", phone: "(555) 019-2244" },
      },
      {
        speaker: "agent",
        text: "Got it, Sarah. Our on-call tech Mike can be there in 40 minutes — want me to dispatch him now?",
      },
      {
        speaker: "caller",
        text: "Yes, please hurry!",
        patch: { slot: "Mike R. — emergency dispatch, ETA 40 min" },
      },
      {
        speaker: "system",
        text: "Syncing job to ServiceTitan…",
      },
      {
        speaker: "system",
        text: "Synced ✅ Job #48213 created, tech assigned, customer notified by SMS.",
        patch: { crm: "Job #48213 created · synced" },
      },
      {
        speaker: "agent",
        text: "You're all set — Mike is on the way and I've texted you his ETA. Anything else?",
      },
      {
        speaker: "caller",
        text: "No, thank you so much!",
      },
      {
        speaker: "system",
        text: "Lead + job auto-logged. Post-job follow-up survey scheduled for +24h.",
        patch: { note: "Follow-up survey scheduled" },
      },
    ],
  },
  {
    id: "quote-chase",
    label: "Unaccepted quote chase-up",
    tagline: "Day 3 · Outbound call · Apex Roofing",
    crmName: "Jobber",
    lines: [
      {
        speaker: "system",
        text: "Quote #3391 ($4,200 roof repair) sent 3 days ago — no response.",
        patch: { issue: "Roof repair quote", urgency: "Follow-up" },
      },
      {
        speaker: "agent",
        text: "Hi Tom, this is Ring calling on behalf of Apex Roofing about the quote we sent for your roof repair. Have you had a chance to look it over?",
      },
      {
        speaker: "caller",
        text: "Oh, right — I was still deciding between two quotes.",
        patch: { customer: "Tom Bracken" },
      },
      {
        speaker: "agent",
        text: "Totally understand. I can lock in this week's pricing and get a crew out by Thursday if you're ready — want me to book it now?",
      },
      {
        speaker: "caller",
        text: "Yeah, let's do it.",
        patch: { slot: "Crew booked — Thursday 9:00 AM" },
      },
      {
        speaker: "system",
        text: "Syncing job to Jobber…",
      },
      {
        speaker: "system",
        text: "Synced ✅ Quote marked accepted, job created, deposit invoice sent.",
        patch: { crm: "Quote accepted · job created · invoice sent" },
      },
      {
        speaker: "agent",
        text: "Perfect, you're booked for Thursday morning. I've sent a text confirmation and the deposit invoice.",
      },
      {
        speaker: "system",
        text: "Outcome logged. Unconverted quotes auto-retry with an incentive text after 48h of silence.",
        patch: { note: "Recovered quote worth $4,200" },
      },
    ],
  },
];

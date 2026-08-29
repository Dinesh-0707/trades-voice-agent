# Ring — AI Voice Agent for Home Service Trades

**Live demo:** [trades-voice-agent.vercel.app](https://trades-voice-agent.vercel.app)

A working AI intake agent for home service trades (HVAC, plumbing, roofing). Ring answers every enquiry, triages emergencies by urgency, books the job against a real dispatch database, and hands it off to a technician — built to stop missed calls from becoming lost jobs.

## What this is

The "Talk to Ring" chat on the demo is backed by a real agent loop: a Gemini model with function-calling tools that can triage the issue, check technician availability, and book the job — writing directly to a real Postgres database (Neon, via Prisma) as the conversation happens. The same agent also answers real phone calls through Twilio voice webhooks, not just the web chat.

A separate scripted walkthrough is included on the page for a quick look without typing — two pre-recorded scenarios (an after-hours emergency, and an unaccepted-quote chase-up) that play back through the same UI.

**Honest scope note:** the CRM sync shown against a booked job (labelled ServiceTitan/Jobber in the product copy) is simulated inside the app — it writes a `SIM-` prefixed reference to the database, not a real call to ServiceTitan's or Jobber's API. Everything else — the agent conversation, the dispatch database, the Twilio voice line, and the technician dispatch board — is real and live.

Real pieces built out alongside the chat agent:
- **Gemini agent loop** (`lib/agent.ts`) — function-calling tools for triage, availability lookup, and job booking against the live database.
- **Twilio voice webhooks** (`app/api/voice/`) — the same agent answering phone calls, not just web chat.
- **Dispatch board** (`app/dispatch/`) — an authenticated view of booked jobs and technician assignment.

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Google Gemini API (`@google/genai`) with function-calling tools for the agent loop
- Prisma + Neon (serverless Postgres)
- Twilio (voice webhooks)
- Tailwind CSS v4

## Getting started

```bash
npm install
npx prisma db push
npm run dev
```

Requires `GEMINI_API_KEY`, a Neon `DATABASE_URL`, and Twilio credentials as environment variables for the voice line.

Open [http://localhost:3000](http://localhost:3000) to view it.

## Project structure

- `app/LiveCall.tsx` / `app/api/chat/route.ts` — the live chat UI and the agent's chat endpoint
- `lib/agent.ts` — the Gemini agent loop and its function-calling tools (triage, availability, booking)
- `app/api/voice/` — Twilio voice webhook handlers for phone-based intake
- `app/dispatch/` — the authenticated technician dispatch board
- `app/data.ts` / `app/CallDemo.tsx` — the scripted walkthrough scenarios and their UI
- `prisma/schema.prisma` — the data model (jobs, customers, technicians)

## License

MIT — see [LICENSE](LICENSE).

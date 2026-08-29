# Ring — AI Voice Agent for Home Service Trades

**Live demo:** [trades-voice-agent.vercel.app](https://trades-voice-agent.vercel.app)

A product concept and interactive UI demo for an AI voice agent aimed at home service trades (HVAC, plumbing, roofing). Ring answers every incoming call, triages emergencies, books the job, and syncs the record to a CRM — designed to stop missed calls from becoming lost jobs.

## What this is

This is a front-end concept demo: a scripted, animated call-transcript simulation showing the end-to-end flow from an inbound call to a booked, CRM-synced job record. It is **not** a live voice AI or CRM integration — no real calls are placed or received, and no ServiceTitan/Jobber connection exists. It's built to communicate the product idea and interaction design clearly, not to process real phone traffic.

Two scenarios are included:
- **After-hours emergency** — an urgent call triaged and booked outside business hours.
- **Unaccepted quote chase-up** — a proactive follow-up call that converts a cold quote into a booked job.

As each scripted call plays, a job record panel fills itself in live (customer, phone, issue, urgency, scheduled time) alongside a simulated CRM sync status.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Project structure

- `app/data.ts` — scripted call scenarios and the dashboard state each line patches in
- `app/CallDemo.tsx` — the interactive transcript/dashboard component
- `app/page.tsx` — landing page and product framing

## License

MIT — see [LICENSE](LICENSE).

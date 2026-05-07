# LB CyberMAP — Cyber Maturity Assessment Platform

Internal-use React front-end for the assessment team. Supports **NIST CSF 2.0**, **CIS Critical Security Controls v8.1.2** (with IG1/IG2/IG3) and **NCSC CAF v4.0**.

This is the front-end only — wired up with seeded mock data and an in-browser store. The back-end and AI pipelines are planned next.

## Features

- Portfolio dashboard, engagement register, client directory, benchmarking, reports
- Twelve-stage engagement workflow: Setup → Footprint → Documentation Review → Workshops & Notes → Observations → Scoring (CMMI) → Risks → Recommendations → Roadmap → Benchmarking → Reporting → Sign-off
- AI Studio screen with a full pipeline mock (transcripts → notes → observations → risks → recommendations → roadmap)
- Maturity radar, heatmap, benchmark bars, risk matrix, roadmap Gantt-style view, year-on-year trend
- Filtering by company, country, industry, framework, IG tier and year
- Modal-driven creation of notes, observations, risks and recommendations
- British English throughout

## Stack

- Vite + React 18 + TypeScript
- TailwindCSS, custom dark-navy design system
- Zustand (with persistence) for state
- TanStack Query for future API plumbing
- Recharts for charts
- React Router v6
- Lucide icons

## Running locally

```bash
npm install
npm run dev
```

Then open http://127.0.0.1:5173

## Project layout

```
src/
├── main.tsx                # entry
├── App.tsx                 # routing
├── styles/index.css        # Tailwind + custom layers
├── types/                  # domain types
├── data/
│   ├── frameworks/         # NIST, CIS, CAF reference content
│   ├── mock-clients.ts
│   ├── mock-engagements.ts # incl. deterministic seed of assessment items
│   ├── mock-benchmarks.ts
│   └── mock-users.ts
├── store/useStore.ts       # zustand store
├── lib/
│   ├── cn.ts               # class merge
│   └── aggregations.ts     # scoring aggregations + benchmark series
├── components/
│   ├── ui/                 # primitives — Button, Card, Badge, Modal, etc.
│   ├── layout/             # AppLayout, Sidebar, TopBar, EngagementShell
│   └── charts/             # Radar, Heatmap, BenchmarkBars, RoadmapGantt, RiskMatrix, YoyTrend, Sparkline
└── pages/
    ├── Dashboard.tsx
    ├── Engagements.tsx
    ├── NewEngagement.tsx
    ├── Clients.tsx
    ├── Benchmarking.tsx
    ├── Reports.tsx
    ├── Frameworks.tsx
    ├── AIStudio.tsx
    ├── Settings.tsx
    └── engagement/         # Setup, Footprint, DocumentationReview, Notes, Observations,
                            # Scoring, Risks, Recommendations, Roadmap, Benchmarking, Report
```

## Mock data

Mock data is seeded at first load and persisted to `localStorage`. Reset from
**Settings → Data → Reset to seed**.

## Notes on accuracy

The framework content shipped here is a **representative subset** for UI demonstration:

- NIST CSF 2.0 — 6 Functions, all 22 Categories, ~70 Subcategories
- CIS Controls v8.1.2 — all 18 Controls, ~85 Safeguards across IG1/IG2/IG3
- NCSC CAF v4.0 — 4 Objectives, 14 Principles, 39 Outcomes (full set)

Full canonical control catalogues will be loaded from the back-end when it lands.

## Next

The back-end plan is documented separately. It introduces:
- Fastify or FastAPI service with PostgreSQL + Prisma
- BullMQ + Redis for async AI jobs
- Anthropic Claude API (Sonnet 4.6 / Haiku 4.5) with optional fully-local Ollama fallback
- Whisper transcription for workshop audio
- PDF/PPTX/DOCX export pipelines
- Internal SSO + audit log

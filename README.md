# Teacher's Desk AI

An AI-powered, production-grade SaaS School Management & Learning Platform supporting Students, Teachers, School Administrators, Super Administrators, and Parents.

## 🚀 Overview

Teacher's Desk AI is a comprehensive, multi-tenant educational ecosystem. It delivers a modern, intuitive workspace for educators and students, featuring seamless learning workflows, real-time data sync, role-based controls, and AI-driven insights.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, React Router v7, Tailwind CSS v4, Lucide Icons, Framer Motion, TanStack Query, React Hook Form, Zod.
- **Backend**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Edge Functions, Realtime, Storage Buckets).
- **AI Engine**: Google Gemini 2.5 Flash (via secure Deno Edge Functions).

---

## ✨ Features

### 🔑 Robust Authentication & Tenant Isolation
- Secure authentication via Supabase Auth.
- Strict multi-tenant isolation enforced through PostgreSQL Row Level Security (RLS) policies on `school_id`.
- Dynamic, role-based redirection supporting Super Admins, School Admins, Teachers, Students, and Parents.

### 📊 Multi-Role Interactive Dashboards
- **Teacher**: Command center featuring quick actions, attendance rate trackers, upcoming class schedules, and system alerts.
- **Student**: Personalized hub displaying current attendance, average grade stats, assigned homework, and a real-time gamification badge chest.
- **School Admin**: High-level school analytics, tenant billing metrics, system health checkers, and user management portals.

### 📋 Interactive Attendance Grid
- Grid-based classroom visualization mimicking actual physical seating.
- Real-time seat updates (Present, Absent, Late, Excused) saved directly to the database.

### 📝 Homework & Grading Hub
- **Students**: Upload, view, and submit assignments with ease.
- **Teachers**: Detailed submission list, automated AI grade/feedback generator, manual scoring overrides, and final grading logs.

### 🏫 Virtual Classroom Meetings
- Scheduler for live class sessions, exam dates, and parent-teacher meetings.
- Direct quick-join links, class lists, and active agenda trackers.

### 🧠 AI Cockpit (Powered by Gemini)
- **AI Quiz Generator**: Creates customizable interactive quizzes based on course subjects and target age. Includes mock database simulation.
- **Student Performance Risk Gauge**: Predicts student performance risks (High/Medium/Low) based on historical grade trends, attendance, and homework submission latency.
- **Automated Behavioral Feedback**: Auto-generates detailed behavioral reports for parents and school management.

---

## 📁 Directory Structure

```
├── .github/                 # GitHub workflows & CI templates
├── public/                  # Static assets and UI mockups
├── src/
│   ├── assets/              # React icons, svgs, and images
│   ├── components/          # Reusable UI controls (Auth guards, protected routes)
│   ├── contexts/            # React context API (Auth contexts)
│   ├── features/            # Core features (Command palettes, search)
│   ├── hooks/               # Custom React hooks (Permissions)
│   ├── layouts/             # Shared page layouts (AppLayout navigation)
│   ├── pages/               # Multi-role pages (Landing, Dashboard, Attendance, Homework, AI Cockpit, etc.)
│   ├── services/            # Supabase clients, Gemini API gateways, and mock databases
│   ├── types/               # TypeScript interfaces mapping the DB schema
│   └── App.tsx              # Application routing and theme layout
├── supabase/
│   ├── functions/           # Deno Edge Functions (Gemini API bridge)
│   └── migrations/          # PostgreSQL database schema and seed migrations
└── vite.config.ts           # Vite build pipeline and configuration
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/daystar-1nine/Teacher-s-Desk.git
   cd Teacher-s-Desk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environmental variables:
   Create a `.env` file in the root directory and configure your Supabase environment:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## 🛡️ Database & Security Setup

The project includes pre-configured SQL migrations in `supabase/migrations/`. These create the tables, relationships, and Row Level Security (RLS) policies needed to secure school data.

To apply migrations locally:
```bash
supabase start
```

For remote staging:
1. Copy the SQL from `supabase/migrations/20260621000000_init_schema.sql`.
2. Execute the script within the Supabase SQL Editor on your project dashboard.

# AUTODOSE — JDM Photography & Lifestyle Hub

A premium JDM car photography and lifestyle platform built with **React + Vite + TypeScript + Tailwind CSS + Supabase**.

## 🚀 Tech Stack

- **Framework:** React 18 + Vite (with SWC)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **State / Data:** TanStack Query (React Query)
- **Routing:** React Router DOM v6
- **Animation:** Framer Motion
- **Video:** HLS.js (adaptive streaming)
- **SEO:** React Helmet Async

## 📋 Prerequisites

- Node.js 18+ (or Bun)
- A [Supabase](https://supabase.com) project

## ⚙️ Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd autodoze-jdm-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   VITE_SUPABASE_PROJECT_ID=your-project-id
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   Open [http://localhost:8080](http://localhost:8080)

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/           # shadcn/ui primitives
├── hooks/            # Custom React hooks
├── integrations/
│   └── supabase/     # Supabase client & generated types
├── lib/              # Utilities (cn, etc.)
├── pages/            # Route-level page components
└── assets/           # Static assets
supabase/
├── functions/        # Supabase Edge Functions
└── migrations/       # Database migrations
```

## 🗄️ Database

Run migrations in your Supabase project via the Supabase CLI:
```bash
supabase db push
```

Or apply them manually from `supabase/migrations/`.

## 🎨 Features

- 🎬 Video gallery with HLS adaptive streaming & chapter support
- 📸 Photo gallery & stories with comments and likes
- 🌙 Light / Dark theme toggle
- 🔐 Auth (sign up / sign in) with Supabase
- 👤 Profile & account settings
- 🛠️ Admin dashboard for content management
- 📱 Fully responsive mobile layout
- 🔍 SEO optimised with Open Graph & JSON-LD

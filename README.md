# Cypress — Notion Clone Pro

A production-ready SaaS Notion clone built with Next.js 14, Supabase, Drizzle ORM, Socket.IO, Quill, and Stripe.

## Tech Stack

- **Framework**: Next.js 14 (App Router + Pages Router for Socket.IO)
- **Auth & DB**: Supabase (Postgres, Auth, Storage)
- **ORM**: Drizzle ORM
- **Real-time**: Socket.IO + Supabase Realtime
- **Editor**: Quill.js with collaborative cursors
- **Payments**: Stripe (subscriptions)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **State**: React Context + useReducer

## Features

- 📝 Rich-text editor (Quill) with formatting toolbar
- 🔄 Real-time collaborative editing with live cursors
- 📁 Workspace → Folder → File hierarchy
- 🗑️ Trash / restore for files and folders
- 🖼️ Custom emoji icons + banner images (Supabase Storage)
- 💳 Stripe subscription billing (Free / Pro plans)
- 👥 Workspace sharing & collaborators
- 🌙 Dark / light mode
- 📱 Responsive with mobile sidebar

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```
Fill in your Supabase, Stripe, and site URL values.

### 3. Run database migrations
```bash
npm run db:push
```

### 4. Start the dev server
```bash
npm run dev
```

### 5. Set up Stripe webhooks (local)
```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

## Database Schema

```
workspaces → folders → files
users ← collaborators → workspaces
subscriptions (Stripe sync)
products / prices (Stripe sync)
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (site)/             # Landing page
│   ├── (auth)/             # Login / signup
│   └── (main)/dashboard/   # Workspace editor
├── components/
│   ├── quill-editor/       # Rich text editor
│   ├── sidebar/            # Workspace navigation
│   ├── settings/           # Workspace settings modal
│   └── global/             # Shared components
├── db/schema.ts            # Drizzle schema
├── lib/
│   ├── supabase/           # Supabase clients + queries
│   ├── providers/          # React context providers
│   └── stripe*.ts          # Stripe utilities
└── pages/api/socket/       # Socket.IO server (Pages Router)
```

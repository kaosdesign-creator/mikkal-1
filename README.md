# Mikkal — Setup Guide
## Your Personal AI Platform

---

## Step 1 — Download Your Code

Save all the files Claude gave you into a folder on your computer called `mikkal`.

---

## Step 2 — Install Node.js

Go to https://nodejs.org and download the **LTS** version. Install it. Restart VS Code after.

---

## Step 3 — Open in VS Code

1. Open VS Code
2. File → Open Folder → select your `mikkal` folder
3. Open the Terminal: View → Terminal

---

## Step 4 — Install Dependencies

In the VS Code terminal, type:
```
npm install
```
Wait for it to finish (about 1-2 minutes).

---

## Step 5 — Set Up Your Environment Variables

1. Copy `.env.example` and rename the copy to `.env.local`
2. Open `.env.local` and fill in each key:

| Variable | Where to get it |
|---|---|
| ANTHROPIC_API_KEY | console.anthropic.com → API Keys |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | clerk.com → Your App → API Keys |
| CLERK_SECRET_KEY | clerk.com → Your App → API Keys |
| NEXT_PUBLIC_SUPABASE_URL | supabase.com → Your Project → Settings → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | supabase.com → Your Project → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | supabase.com → Your Project → Settings → API |
| TAVILY_API_KEY | tavily.com → Dashboard |
| OPENAI_API_KEY | platform.openai.com → API Keys |
| STABILITY_API_KEY | platform.stability.ai → API Keys |

---

## Step 6 — Set Up Supabase Database

1. Go to supabase.com → your project
2. Click **SQL Editor** in the left sidebar
3. Open the file `supabase-schema.sql` from your mikkal folder
4. Copy everything in it
5. Paste into the Supabase SQL Editor
6. Click **Run**

---

## Step 7 — Set Up Clerk

1. Go to clerk.com → your app
2. Under **User & Authentication** → set Sign-in to Email + Password
3. Under **Restrictions** → turn ON "Restricted sign-ups" (invite only)
4. Copy your API keys into `.env.local`

---

## Step 8 — Test Locally

In VS Code terminal:
```
npm run dev
```
Open your browser to: http://localhost:3000

---

## Step 9 — Deploy to Vercel

1. Push your code to GitHub (ask Claude to walk through this step)
2. Go to vercel.com → New Project → Import from GitHub
3. Add all your `.env.local` variables in Vercel's Environment Variables section
4. Click Deploy
5. Add your custom domain: mikkal.ai

---

## Step 10 — Invite Your Family

1. Go to clerk.com → your app → Users
2. Click **Invite** → type their email → send
3. They get an email, click the link, set a password, and they're in Mikkal

---

## Adding Personal Welcome Notes

Open the file: `app/welcome/page.tsx`
Find the `PERSONAL_NOTES` section near the top.
Add each person's Clerk User ID and their personal note:

```
'user_abc123': "You're one of my favorite people. Welcome to something special.",
```

You can find each person's User ID in your Clerk dashboard under Users.

---

## Need Help?

Just open a new conversation with Claude in the Mikkal project and describe what's happening. Every problem has a fix.

# Mikkal v2 — Setup Guide

## What Changed From v1
- Removed Clerk — replaced with NextAuth (works on any domain, free)
- New modern light theme
- Simpler user management — you control users directly in the code

---

## Step 1 — Replace Your Files

Copy all these new files into your existing mikkal folder, replacing the old ones.

---

## Step 2 — Generate Your NEXTAUTH_SECRET

In VS Code terminal type:
```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Copy the output and paste it as your NEXTAUTH_SECRET in .env.local

---

## Step 3 — Set Your Password

Visit this URL on your LOCAL server (after npm run dev):
```
http://localhost:3000/api/hash?password=YourChosenPassword
```
Copy the hash value from the response.

Open `app/api/auth/[...nextauth]/route.ts`
Find the APPROVED_USERS section and paste your hash as the password value.

---

## Step 4 — Update .env.local

Add these new variables:
```
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=https://mikkal.vercel.app
```

Remove these old variables (no longer needed):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

---

## Step 5 — Install New Dependencies

In VS Code terminal:
```
npm install
```

---

## Step 6 — Test Locally

```
npm run dev
```
Go to http://localhost:3000 and sign in with your email and chosen password.

---

## Step 7 — Deploy to Vercel

In Vercel Environment Variables, add:
- NEXTAUTH_SECRET = your generated secret
- NEXTAUTH_URL = https://mikkal.vercel.app

Remove the old Clerk variables.

Then push to GitHub:
```
git add .
git commit -m "v2 light theme nextauth"
git push
```

Vercel auto-deploys. Done.

---

## Adding Family Members

Open `app/api/auth/[...nextauth]/route.ts`

1. Generate their password hash: visit `/api/hash?password=TheirPassword`
2. Add them to APPROVED_USERS like this:

```
{
  id: '2',
  name: 'Sandra Smith',
  email: 'sandra@email.com',
  password: 'paste_their_hash_here',
  role: 'lifetime',
  note: 'Your personal message to Sandra here.',
},
```

3. Save → git push → auto-deploys
4. Tell them their email and password

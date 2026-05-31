This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Setup

This project uses PostgreSQL with Drizzle ORM. Follow these steps to configure your database:

1. **Get a PostgreSQL Database:**
   - Create a free serverless database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
   - Copy the connection string (e.g., `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`).

2. **Configure Environment Variables:**
   - Open the [.env](file:///c:/Users/ASUS/OneDrive/Desktop/personal/saas/.env) file.
   - Paste your connection string into `DATABASE_URL` and `POSTGRES_URL`.

3. **Push Schema to Database:**
   - Push your Drizzle schema tables and relationships directly to the database:
     ```bash
     npm run db:push
     ```

4. **Manage Data with Drizzle Studio:**
   - Run the Drizzle Studio visual console to inspect, edit, or insert database records:
     ```bash
     npm run db:studio
     ```


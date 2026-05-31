import { auth } from "@/auth";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getCurrentOrg } from "@/lib/db/tenant";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getCurrentOrg(session);
    if (!orgId) {
      return NextResponse.json({ message: "No active organization found" }, { status: 400 });
    }

    const [org] = await db
      .select({ stripeCustomerId: organizations.stripeCustomerId })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!org || !org.stripeCustomerId) {
      return NextResponse.json({ message: "No active subscription billing profile found" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ message: "Billing service currently unavailable" }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const baseUrl = req.nextUrl.origin;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: `${baseUrl}/app?tab=accounts`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe Portal session creation failed:", error);
    return NextResponse.json({ message: "Failed to load billing portal" }, { status: 500 });
  }
}

import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/db/tenant";
import { getPlanDetails } from "@/lib/billing/plans";
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

    const { plan } = await req.json();
    if (!plan || (plan !== "pro" && plan !== "agency")) {
      return NextResponse.json({ message: "Invalid plan selected" }, { status: 400 });
    }

    const planDetails = getPlanDetails(plan);
    const priceId = planDetails.priceId;

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.warn("⚠️ Warning: STRIPE_SECRET_KEY is not set. Checkout session will fail.");
      return NextResponse.json({ message: "Billing service currently unavailable" }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const baseUrl = req.nextUrl.origin;

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: orgId, // CRITICAL: identifies which org tenant is upgrading
      customer_email: session.user.email,
      success_url: `${baseUrl}/app?tab=accounts&billing=success`,
      cancel_url: `${baseUrl}/app?tab=accounts&billing=cancel`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Checkout creation failed:", error);
    return NextResponse.json({ message: "Failed to create checkout session" }, { status: 500 });
  }
}

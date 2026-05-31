import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PLANS } from "@/lib/billing/plans";

const stripeKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2023-10-16" }) : null;

// Resolve price ID back to plan name (pro/agency)
function resolvePlanName(priceId) {
  if (!priceId) return "free";
  
  if (priceId === PLANS.pro.priceId) return "pro";
  if (priceId === PLANS.agency.priceId) return "agency";

  return "free";
}

export async function POST(req) {
  if (!stripe || !endpointSecret) {
    console.error("❌ Stripe or Webhook Secret is not configured.");
    return NextResponse.json({ received: false, error: "Webhook configuration missing" }, { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ received: false, error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!orgId) {
          console.error("❌ Checkout session completed without client_reference_id (orgId)");
          break;
        }

        // Retrieve subscription details to find the price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = resolvePlanName(priceId);

        await db
          .update(organizations)
          .set({
            plan,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId));

        console.log(`✅ Organization ${orgId} upgraded to ${plan} successfully.`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = resolvePlanName(priceId);

        // Find organization by customer ID
        const [org] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.stripeCustomerId, customerId))
          .limit(1);

        if (org) {
          await db
            .update(organizations)
            .set({
              plan,
              stripeSubscriptionId: subscription.id,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, org.id));
          
          console.log(`✅ Subscription updated for org ${org.id}. Plan: ${plan}`);
        } else {
          console.warn(`⚠️ Organization not found for customerId: ${customerId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find organization by customer ID and downgrade to free
        const [org] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.stripeCustomerId, customerId))
          .limit(1);

        if (org) {
          await db
            .update(organizations)
            .set({
              plan: "free",
              stripeSubscriptionId: null,
              updatedAt: new Date(),
            })
            .where(eq(organizations.id, org.id));
          
          console.log(`✅ Subscription deleted. Org ${org.id} downgraded to free.`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ received: false, error: "Internal processing error" }, { status: 500 });
  }
}

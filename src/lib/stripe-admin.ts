import Stripe from "stripe";
import { stripe } from "./stripe";
import { toDateTime } from "./stripe";
import { db } from "./db";
import { customers, prices, products, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const upsertProductRecord = async (product: Stripe.Product) => {
  const productData = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };
  await db.insert(products).values(productData).onConflictDoUpdate({ target: products.id, set: productData });
};

export const upsertPriceRecord = async (price: Stripe.Price) => {
  const priceData = {
    id: price.id,
    productId: typeof price.product === "string" ? price.product : "",
    active: price.active,
    currency: price.currency,
    description: price.nickname ?? null,
    type: price.type,
    unitAmount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    intervalCount: price.recurring?.interval_count ?? null,
    trialPeriodDays: price.recurring?.trial_period_days ?? null,
    metadata: price.metadata,
  };
  await db.insert(prices).values(priceData as any).onConflictDoUpdate({ target: prices.id, set: priceData as any });
};

export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  const response = await db.query.customers.findFirst({
    where: (c, { eq }) => eq(c.id, uuid),
  });
  if (!response?.stripeCustomerId) {
    const customerData: { metadata: { supabaseUUID: string }; email?: string } = {
      metadata: { supabaseUUID: uuid },
    };
    if (email) customerData.email = email;
    const customer = await stripe.customers.create(customerData);
    await db.insert(customers).values({ id: uuid, stripeCustomerId: customer.id });
    return customer.id;
  }
  return response.stripeCustomerId;
};

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  const customerData = await db.query.customers.findFirst({
    where: (c, { eq }) => eq(c.stripeCustomerId, customerId),
  });
  if (!customerData) throw new Error(`No customer found for Stripe customer ${customerId}`);
  const { id: uuid } = customerData;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method"],
  });

  const subscriptionData = {
    id: subscription.id,
    userId: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    created: toDateTime(subscription.created).toISOString(),
    currentPeriodStart: toDateTime(subscription.current_period_start).toISOString(),
    currentPeriodEnd: toDateTime(subscription.current_period_end).toISOString(),
    endedAt: subscription.ended_at ? toDateTime(subscription.ended_at).toISOString() : null,
    cancelAt: subscription.cancel_at ? toDateTime(subscription.cancel_at).toISOString() : null,
    canceledAt: subscription.canceled_at ? toDateTime(subscription.canceled_at).toISOString() : null,
    trialStart: subscription.trial_start ? toDateTime(subscription.trial_start).toISOString() : null,
    trialEnd: subscription.trial_end ? toDateTime(subscription.trial_end).toISOString() : null,
  };

  await db
    .insert(subscriptions)
    .values(subscriptionData as any)
    .onConflictDoUpdate({ target: subscriptions.id, set: subscriptionData as any });
};

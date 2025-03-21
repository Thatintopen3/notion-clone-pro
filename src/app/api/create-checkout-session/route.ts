import { createServerComponentClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getURL } from "@/lib/stripe";
import { createOrRetrieveCustomer } from "@/lib/stripe-admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { price, quantity = 1, metadata = {} } = await req.json();

  try {
    const supabase = createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    const customer = await createOrRetrieveCustomer({
      uuid: user?.id || "",
      email: user?.email || "",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer,
      line_items: [{ price: price.id, quantity }],
      mode: "subscription",
      allow_promotion_codes: true,
      subscription_data: { trial_from_plan: true, metadata },
      success_url: `${getURL()}/dashboard`,
      cancel_url: `${getURL()}/dashboard`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

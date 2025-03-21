import { createServerComponentClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getURL } from "@/lib/stripe";
import { createOrRetrieveCustomer } from "@/lib/stripe-admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw Error("Could not get user");

    const customer = await createOrRetrieveCustomer({
      uuid: user.id || "",
      email: user.email || "",
    });
    if (!customer) throw Error("No customer.");

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/dashboard`,
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

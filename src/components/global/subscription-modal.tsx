"use client";
import React, { useState } from "react";
import { Price, ProductWithPrice } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { postData } from "@/lib/stripe";
import { getURL } from "@/lib/stripe";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@/lib/supabase";

interface SubscriptionModalProps {
  products: ProductWithPrice[];
}

export default function SubscriptionModal({ products }: SubscriptionModalProps) {
  const { open, setOpen } = useSubscriptionModal();
  const [isLoading, setIsLoading] = useState(false);
  const { user, subscription } = useSupabaseUser();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const onClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);
      if (subscription?.status === "active") {
        toast({ title: "Already on a pro plan!", description: "You are already on the Pro Plan." });
        return;
      }
      if (!user) {
        toast({ title: "You must be logged in", description: "Please login to continue." });
        return;
      }
      const { sessionId } = await postData({ url: "/api/create-checkout-session", data: { price } });
      const stripe = (await import("@/lib/stripe-client")).getStripe();
      (await stripe)?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({ variant: "destructive", title: "Oops! Something went wrong.", description: "Error creating checkout session" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to a Pro Plan</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          To access Pro features you need to have a paid plan.
        </DialogDescription>
        {products.length
          ? products.map((product) => (
              <div key={product.id} className="flex justify-between items-center">
                {product.prices?.map((price) => (
                  <React.Fragment key={price.id}>
                    <b className="text-3xl text-foreground">
                      {formatPrice(price.unitAmount || 0)} / <small>{price.interval}</small>
                    </b>
                    <Button onClick={() => onClickContinue(price)} disabled={isLoading}>
                      {isLoading ? <Loader /> : "Upgrade ✈️"}
                    </Button>
                  </React.Fragment>
                ))}
              </div>
            ))
          : ""}
      </DialogContent>
    </Dialog>
  );
}

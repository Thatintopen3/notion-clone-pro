"use client";
import React, { createContext, useContext, useState } from "react";
import { ProductWithPrice } from "@/lib/types";
import SubscriptionModal from "@/components/global/subscription-modal";

interface SubscriptionModalContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubscriptionModalContext = createContext<SubscriptionModalContextType>({
  open: false,
  setOpen: () => {},
});

export function SubscriptionModalProvider({
  children,
  products,
}: {
  children: React.ReactNode;
  products: ProductWithPrice[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <SubscriptionModalContext.Provider value={{ open, setOpen }}>
      {children}
      <SubscriptionModal products={products} />
    </SubscriptionModalContext.Provider>
  );
}

export function useSubscriptionModal() {
  return useContext(SubscriptionModalContext);
}

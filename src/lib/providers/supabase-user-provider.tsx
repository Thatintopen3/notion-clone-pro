"use client";
import { AuthUser } from "@supabase/supabase-js";
import { Subscription } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase";
import { getUserSubscriptionStatus } from "@/lib/supabase/queries";
import { useToast } from "@/components/ui/use-toast";

interface SupabaseUserContextType {
  user: AuthUser | null;
  subscription: Subscription | null;
}

const SupabaseUserContext = createContext<SupabaseUserContextType>({
  user: null,
  subscription: null,
});

export function SupabaseUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await getUserSubscriptionStatus(user.id);
        if (data) setSubscription(data);
        if (error) {
          toast({ title: "Unexpected Error", description: "Oops! An unexpected error occurred. Try again later.", variant: "destructive" });
        }
      }
    };
    getUser();
  }, [supabase, toast]);

  return (
    <SupabaseUserContext.Provider value={{ user, subscription }}>
      {children}
    </SupabaseUserContext.Provider>
  );
}

export function useSupabaseUser() {
  return useContext(SupabaseUserContext);
}

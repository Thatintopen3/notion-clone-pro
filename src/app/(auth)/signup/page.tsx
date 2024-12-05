"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";
import clsx from "clsx";

const SignUpFormSchema = z
  .object({
    email: z.string().describe("Email").email({ message: "Invalid email" }),
    password: z.string().describe("Password").min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().describe("Confirm Password").min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormValues>({ mode: "onChange", resolver: zodResolver(SignUpFormSchema) });

  const onSubmit: SubmitHandler<SignUpFormValues> = async ({ email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
    });
    if (error) {
      reset();
      setSubmitError(error.message);
    } else {
      setConfirmation(true);
    }
  };

  return (
    <form
      onChange={() => setSubmitError("")}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
    >
      <Link href="/" className="w-full flex justify-left items-center">
        <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">cypress.</span>
      </Link>
      <span className="font-light">An all-In-One Collaboration and Productivity Platform</span>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && <small className="text-red-600">{errors.email.message}</small>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          disabled={isSubmitting}
        />
        {errors.password && <small className="text-red-600">{errors.password.message}</small>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register("confirmPassword")}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && <small className="text-red-600">{errors.confirmPassword.message}</small>}
      </div>
      {submitError && <small className="text-red-600">{submitError}</small>}
      <Button type="submit" className="w-full p-6" disabled={isSubmitting}>
        {!isSubmitting ? "Create Account" : <Loader className="animate-spin" />}
      </Button>
      <span className="self-center">
        Already have an account?{" "}
        <Link href="/login" className="text-primary">
          Login
        </Link>
      </span>
      {confirmation && (
        <Alert className={clsx("bg-primary", { "border-red-500": submitError, "border-blue-500": !submitError })}>
          <MailCheck className="h-4 w-4" />
          <AlertTitle>Check your email.</AlertTitle>
          <AlertDescription>An email confirmation has been sent.</AlertDescription>
        </Alert>
      )}
    </form>
  );
}

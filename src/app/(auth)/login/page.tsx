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

const LoginFormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid email" }),
  password: z.string().describe("Password").min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({ mode: "onChange", resolver: zodResolver(LoginFormSchema) });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      reset();
      setSubmitError(error.message);
    } else {
      toast({ title: "Success", description: "You are now signed in." });
      router.replace("/dashboard");
    }
  };

  return (
    <form
      onChange={() => setSubmitError("")}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
    >
      <Link href="/" className="w-full flex justify-left items-center" >
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
      {submitError && <small className="text-red-600">{submitError}</small>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {!isSubmitting ? "Login" : <Loader className="animate-spin" />}
      </Button>
      <span className="self-center">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary">
          Sign Up
        </Link>
      </span>
    </form>
  );
}

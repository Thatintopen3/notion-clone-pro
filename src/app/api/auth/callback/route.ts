import { createServerComponentClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  if (code) {
    const supabase = createServerComponentClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(requestUrl.origin + "/dashboard");
}

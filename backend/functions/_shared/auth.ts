import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Auth helper for this project's native Supabase Auth mode (auth.uid() RLS).
 * Verifies the caller's session JWT by asking Supabase to resolve it.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface AuthUser {
  userId: string;
  email?: string;
}

export async function requireAuth(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new AuthError(error?.message || "Unauthorized");
  return { userId: data.user.id, email: data.user.email ?? undefined };
}

/** Service-role client — bypasses RLS. Only for billing writes the user can't do themselves. */
export function createAdminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

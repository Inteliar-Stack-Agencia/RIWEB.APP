import type { AuditFunctionResult } from "../types";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

const authHeaders = () => ({
  apikey: supabaseAnonKey || "",
  Authorization: `Bearer ${supabaseAnonKey || ""}`,
  "Content-Type": "application/json",
  Prefer: "return=representation"
});

export async function insertRow<T extends object>(table: string, payload: T) {
  if (!hasSupabaseConfig) throw new Error("Missing Supabase env");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase insert failed (${table}) ${res.status}: ${body}`);
  }
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) {
    throw new Error(`Supabase insert failed (${table}): empty response`);
  }
  return data?.[0] as { id: string };
}

export async function getSingle<T>(table: string, id: string) {
  if (!hasSupabaseConfig) throw new Error("Missing Supabase env");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}&select=*`, {
    headers: {
      apikey: supabaseAnonKey || "",
      Authorization: `Bearer ${supabaseAnonKey || ""}`
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase read failed (${table}) ${res.status}: ${body}`);
  }
  const data = await res.json();
  return (data?.[0] || null) as T | null;
}

export async function runAudit(url: string) {
  if (!hasSupabaseConfig) {
    throw new Error("Missing Supabase env");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/audit`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey || "",
      Authorization: `Bearer ${supabaseAnonKey || ""}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  const body = await res.text();
  let parsed: unknown;
  try {
    parsed = body ? JSON.parse(body) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const errMsg = typeof parsed === "object" && parsed && "error" in parsed
      ? String((parsed as { error: unknown }).error)
      : body;
    throw new Error(`Audit function failed ${res.status}: ${errMsg || "Unknown error"}`);
  }

  if (!parsed || typeof parsed !== "object" || !("ok" in parsed) || (parsed as { ok: boolean }).ok !== true) {
    throw new Error("Audit function returned an invalid payload");
  }

  return parsed as AuditFunctionResult;
}

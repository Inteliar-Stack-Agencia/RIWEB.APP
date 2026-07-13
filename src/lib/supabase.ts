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
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase insert failed (${table}) ${res.status}: ${body}`);
  }
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Supabase insert failed (${table}): unexpected response format`);
  }
  return data[0] as { id: string } & Partial<T>;
}

export async function listRows<T>(table: string, query = "select=*") {
  if (!hasSupabaseConfig) throw new Error("Missing Supabase env");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseAnonKey || "",
      Authorization: `Bearer ${supabaseAnonKey || ""}`
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase list failed (${table}) ${res.status}: ${body}`);
  }
  return await res.json() as T[];
}

export async function updateRow<TPayload extends object, TRow>(table: string, id: string, payload: TPayload) {
  if (!hasSupabaseConfig) throw new Error("Missing Supabase env");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}&select=*`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase update failed (${table}) ${res.status}: ${body}`);
  }
  const data = await res.json();
  return (data?.[0] || null) as TRow | null;
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

export async function callGenerateReport(audit: AuditFunctionResult, locale = "es") {
  if (!hasSupabaseConfig) throw new Error("Missing Supabase env");
  const res = await fetch(`${supabaseUrl}/functions/v1/generate-report`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey || "",
      Authorization: `Bearer ${supabaseAnonKey || ""}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ audit, locale })
  });
  if (!res.ok) throw new Error(`Report generation failed: ${await res.text()}`);
  const data = await res.json();
  return data.report as {
    summary: string;
    opportunities: string[];
    risks: string[];
    roadmap: string[];
    cta: string;
  };
}

export async function callGenerateBotPrompt(
  clientName: string,
  bizType: string,
  training: object,
  accessToken: string
): Promise<string> {
  if (!hasSupabaseConfig) throw new Error("Missing Supabase env");
  const res = await fetch(`${supabaseUrl}/functions/v1/generate-bot-prompt`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey || "",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ clientName, bizType, training })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body?.ok) {
    throw new Error(body?.error ?? `Bot prompt generation failed: ${res.status}`);
  }
  return body.prompt as string;
}

// ── Supabase Auth ─────────────────────────────────────────────────────────

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase config");
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error_description || body.msg || "Credenciales inválidas");
  }
  return res.json();
}

export async function signOut(accessToken: string): Promise<void> {
  if (!supabaseUrl || !supabaseAnonKey) return;
  await fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` },
  });
}

// ── Admin CRUD (authenticated) ────────────────────────────────────────────

function adminHeaders(accessToken: string) {
  return {
    apikey: supabaseAnonKey || "",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function listRowsAuth<T>(
  table: string,
  accessToken: string,
  query = "select=*"
): Promise<T[]> {
  if (!supabaseUrl) throw new Error("Missing Supabase URL");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: { apikey: supabaseAnonKey || "", Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`List ${table} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function insertRowAuth<T extends object>(
  table: string,
  payload: T,
  accessToken: string
): Promise<{ id: string } & T> {
  if (!supabaseUrl) throw new Error("Missing Supabase URL");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: adminHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Insert ${table} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data[0] as { id: string } & T;
}

export async function updateRowAuth<T extends object>(
  table: string,
  id: string,
  payload: Partial<T>,
  accessToken: string
): Promise<T | null> {
  if (!supabaseUrl) throw new Error("Missing Supabase URL");
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: adminHeaders(accessToken),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update ${table} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return (data?.[0] ?? null) as T | null;
}

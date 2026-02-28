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
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status}`);
  const data = await res.json();
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
  if (!res.ok) throw new Error(`Supabase read failed: ${res.status}`);
  const data = await res.json();
  return (data?.[0] || null) as T | null;
}

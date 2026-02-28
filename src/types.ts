export type Locale = "en" | "es";

export type LeadStatus = "new" | "contacted" | "won" | "lost";

export interface Lead {
  id: string;
  email: string;
  url: string;
  locale: Locale;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
  created_at: string;
}

export interface Audit {
  id: string;
  lead_id: string;
  url: string;
  fetched_at: string;
  metrics: Record<string, number>;
  tech: Record<string, unknown>;
  score_total: number;
}

export interface Report {
  id: string;
  lead_id: string;
  audit_id: string;
  locale: Locale;
  summary: string;
  opportunities: string[];
  risks: string[];
  created_at: string;
}

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
  roadmap: string[];
  created_at: string;
}

export interface AuditIssue {
  title: string;
  why: string;
  fix: string;
  impact: "low" | "medium" | "high";
}

export interface AuditQuickWin {
  title: string;
  how: string;
  impact: "low" | "medium" | "high";
}

export interface AuditFunctionResult {
  ok: true;
  url: string;
  tech: Record<string, boolean>;
  signals: Record<string, unknown>;
  metrics: {
    seoBasics: number;
    mobile: number;
    conversion: number;
    aiReadiness: number;
    performance: number;
    speed: number;
    security: number;
    accessibility: number;
  };
  scoreTotal: number;
  issues: AuditIssue[];
  quickWins: AuditQuickWin[];
}

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

// ── Admin dashboard types ─────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  business_type: string | null;
  whatsapp: string | null;
  active: boolean;
  created_at: string;
  updated_at: string | null;
  // Suscripción
  plan: string | null;
  precio_base: number | null;
  precio_total: number | null;
  estado_pago: string | null;
  pago_50_percent: number | null;
  pago_final: number | null;
  fecha_contratacion: string | null;
  fecha_entrega_estimada: string | null;
  fecha_entrega_real: string | null;
  fecha_expiracion_soporte: string | null;
  // Hosting
  hosting_proveedor: string | null;
  hosting_url: string | null;
  dominio: string | null;
  dominio_propio: boolean | null;
  // Uso
  creditos_disponibles: number | null;
  mensajes_usados_este_mes: number | null;
  leads_capturados: number | null;
}

export interface Conversation {
  id: string;
  client_id: string;
  telefono: string;
  role: string;
  content: string;
  created_at: string;
}

export interface Pago {
  id: string;
  client_id: string;
  concepto: string;
  monto: number;
  moneda: string | null;
  estado: string | null;
  metodo_pago: string | null;
  referencia_transaccion: string | null;
  fecha_vencimiento: string | null;
  fecha_pagado: string | null;
  notas: string | null;
  created_at: string;
}

export interface AIPrompt {
  id: string;
  client_id: string;
  business_type: string | null;
  tone: string;
  objective: string | null;
  system_prompt: string | null;
  active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface BotLead {
  id: string;
  client_id: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  client_id: string;
  telefono: string | null;
  problema: string;
  estado: string;
  prioridad: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Proyecto {
  id: string;
  client_id: string;
  nombre: string;
  tipo: string | null;
  estado: string;
  url_produccion: string | null;
  fecha_inicio: string | null;
  fecha_entrega: string | null;
  notas: string | null;
  created_at: string;
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
  report?: any;
}

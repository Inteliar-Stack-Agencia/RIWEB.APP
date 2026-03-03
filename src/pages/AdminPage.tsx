import { FormEvent, useEffect, useMemo, useState } from "react";
import { getAdminLeads, updateLead } from "../lib/data";
import type { Lead, LeadStatus } from "../types";

const statuses: LeadStatus[] = ["new", "contacted", "won", "lost"];

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [status, setStatus] = useState<LeadStatus>("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAdminLeads()
      .then((rows) => {
        if (cancelled) return;
        setLeads(rows);
        if (rows[0]) {
          setSelectedLeadId(rows[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load leads", err);
        if (!cancelled) setError("No pudimos cargar los leads.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  useEffect(() => {
    if (!selectedLead) return;
    setStatus(selectedLead.status);
    setNotes(selectedLead.notes || "");
  }, [selectedLead]);

  const totals = useMemo(() => ({
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    won: leads.filter((lead) => lead.status === "won").length
  }), [leads]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setSaving(true);
    setError(null);

    try {
      const updated = await updateLead(selectedLead.id, {
        status,
        notes: notes.trim() ? notes.trim() : null
      });

      setLeads((prev) => prev.map((lead) => lead.id === updated.id ? updated : lead));
    } catch (err) {
      console.error("Failed to update lead", err);
      setError("No pudimos guardar cambios del lead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="admin-shell">
      <div className="card">
        <h2>Consola Admin</h2>
        <p className="muted">Ruta activa: <code>/admin</code></p>
        <div className="grid">
          <div><p className="muted">Leads totales</p><p className="kpi">{totals.total}</p></div>
          <div><p className="muted">Nuevos</p><p className="kpi">{totals.new}</p></div>
          <div><p className="muted">Ganados</p><p className="kpi">{totals.won}</p></div>
        </div>
      </div>

      <div className="card admin-layout">
        <div>
          <h3>Leads</h3>
          {loading ? <p className="muted">Cargando...</p> : null}
          {!loading && leads.length === 0 ? <p className="muted">Sin leads todavía.</p> : null}

          <div className="admin-list">
            {leads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                className={`admin-list-item ${selectedLeadId === lead.id ? "active" : ""}`}
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <strong>{lead.email}</strong>
                <span className="muted">{lead.url}</span>
                <span className="badge">{lead.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3>Detalle</h3>
          {!selectedLead ? <p className="muted">Seleccioná un lead.</p> : (
            <form onSubmit={save}>
              <label>Email</label>
              <input value={selectedLead.email} disabled />

              <label>URL</label>
              <input value={selectedLead.url} disabled />

              <label>Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>

              <label>Notas</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Próximo paso comercial..." />

              <button disabled={saving} type="submit">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </form>
          )}
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}

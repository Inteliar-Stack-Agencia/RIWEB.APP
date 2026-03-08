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
      <header className="topbar">
        <div className="logo">RIWEB ADMIN</div>
        <div className="muted" style={{ color: 'rgba(255,255,255,0.6)' }}>v2.0 Liquid Glass</div>
      </header>

      <div id="app">
        <div className="hero" style={{ marginBottom: '2rem' }}>
          <h1>Panel de Control</h1>
          <p className="muted">Gestioná tus leads y auditorías con inteligencia.</p>
        </div>

        <div className="grid" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <p className="muted">Leads totales</p>
            <p className="kpi">{totals.total}</p>
          </div>
          <div className="card">
            <p className="muted">Nuevos / Pendientes</p>
            <p className="kpi" style={{ color: 'var(--color-cta)' }}>{totals.new}</p>
          </div>
          <div className="card">
            <p className="muted">Convertidos (Won)</p>
            <p className="kpi" style={{ color: '#10b981' }}>{totals.won}</p>
          </div>
        </div>

        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Leads Recientes</h3>
              {loading && <span className="badge">Cargando...</span>}
            </div>

            {!loading && leads.length === 0 ? <p className="muted">Aún no hay leads registrados.</p> : null}

            <div className="admin-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`card ${selectedLeadId === lead.id ? "active-lead" : ""}`}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    border: selectedLeadId === lead.id ? '2px solid var(--color-cta)' : '1px solid var(--glass-border)',
                    backgroundColor: selectedLeadId === lead.id ? 'rgba(202, 138, 4, 0.05)' : 'var(--glass-bg)',
                    marginBottom: 0
                  }}
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <div style={{ fontWeight: 600 }}>{lead.email}</div>
                  <div className="muted" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{lead.url}</div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="badge" style={{
                      backgroundColor: lead.status === 'won' ? '#d1fae5' : lead.status === 'lost' ? '#fee2e2' : '#fefce8',
                      color: lead.status === 'won' ? '#065f46' : lead.status === 'lost' ? '#991b1b' : '#854d0e'
                    }}>
                      {lead.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: '1 1 500px', position: 'sticky', top: '2rem' }}>
            <h3 style={{ margin: 0 }}>Detalle del Lead</h3>
            {!selectedLead ? (
              <div style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p className="muted">Seleccioná un lead de la lista para ver todos los detalles y gestionar su estado.</p>
              </div>
            ) : (
              <form onSubmit={save} style={{ marginTop: '1.5rem' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label>Email</label>
                    <input value={selectedLead.email} disabled style={{ backgroundColor: '#f1f5f9' }} />
                  </div>
                  <div>
                    <label>URL del Sitio</label>
                    <input value={selectedLead.url} disabled style={{ backgroundColor: '#f1f5f9' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label>Cambiar Estado</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
                    {statuses.map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label>Notas Internas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Escribí aquí observaciones, próximos pasos o detalles de la llamada..."
                  />
                </div>

                <button
                  disabled={saving}
                  type="submit"
                  style={{
                    marginTop: '1rem',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  {saving ? "Guardando cambios..." : "Guardar Actualización"}
                </button>
                {error ? <p className="error-text" style={{ textAlign: 'center' }}>{error}</p> : null}
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .active-lead {
          box-shadow: var(--shadow-lg) !important;
        }
        label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          color: var(--color-secondary);
        }
        .admin-shell {
          min-height: 100vh;
          padding-bottom: 4rem;
        }
      `}</style>
    </section>
  );
}

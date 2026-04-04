import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { listRowsAuth } from "../../lib/supabase";
import type { Client } from "../../types";

export interface DashboardContext {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  clients: Client[];
  refreshClients: () => Promise<void>;
}

const NAV = [
  { to: "/dashboard/clients", label: "Clientes",      icon: "👥" },
  { to: "/dashboard/bot",     label: "Bot / Prompts", icon: "🤖" },
  { to: "/dashboard/leads",   label: "Leads",         icon: "📋" },
];

export default function DashboardLayout() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchClients = async () => {
    if (!token) return;
    try {
      const data = await listRowsAuth<Client>("clients", token, "select=*&active=eq.true&order=name.asc");
      setClients(data);
      if (!selectedClientId && data.length > 0) setSelectedClientId(data[0].id);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  useEffect(() => { fetchClients(); }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const ctx: DashboardContext = {
    selectedClientId,
    setSelectedClientId,
    clients,
    refreshClients: fetchClients,
  };

  return (
    <div className="admin-layout">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 45 }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>

        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <img src="/logo.svg" alt="RIWEB" style={{ height: "24px", width: "24px" }} />
            <span style={{
              fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em",
              color: "#f59e0b", textTransform: "uppercase",
            }}>
              RIWEB
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }}>Admin</div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
            Interliar Stack
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-item${isActive ? " active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{
          padding: "0.75rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            fontSize: "0.72rem", color: "var(--text-muted)",
            marginBottom: "0.5rem", paddingLeft: "0.5rem",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {user?.email}
          </div>
          <button onClick={handleLogout} className="admin-nav-item" style={{ color: "#f87171", width: "100%" }}>
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="admin-main">

        {/* Header */}
        <header className="admin-header">

          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="admin-mobile-menu"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-main)", fontSize: "1.4rem", padding: "0.5rem",
              lineHeight: 1, borderRadius: "8px",
            }}
          >
            ☰
          </button>

          {/* Client selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginLeft: "auto" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>
              Cliente:
            </span>
            <select
              className="client-selector"
              value={selectedClientId || ""}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
            >
              <option value="">— Sin seleccionar —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Active client badge */}
          {selectedClient?.business_type && (
            <span className="admin-badge badge-amber" style={{ flexShrink: 0 }}>
              {selectedClient.business_type}
            </span>
          )}
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet context={ctx} />
        </main>
      </div>
    </div>
  );
}

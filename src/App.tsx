import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import AuditPage from "./pages/AuditPage";
import BotDetailsPage from "./pages/BotDetailsPage";
import BotsPage from "./pages/BotsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ReportPage from "./pages/ReportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ClientsPage from "./pages/dashboard/ClientsPage";
import BotPage from "./pages/dashboard/BotPage";
import LeadsPage from "./pages/dashboard/LeadsPage";
import SubscriptionsPage from "./pages/dashboard/SubscriptionsPage";
import MisBotsPage from "./pages/dashboard/MisBotsPage";
import TicketsPage from "./pages/dashboard/TicketsPage";
import ProyectosPage from "./pages/dashboard/ProyectosPage";

// Wraps public routes with the existing top-nav Layout
function PublicWrapper() {
  return <Layout><Outlet /></Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Public routes (with top nav Layout) ──────────────────── */}
        <Route element={<PublicWrapper />}>
          {/* Default language: Spanish */}
          <Route path="/"              element={<HomePage locale="es" />} />
          <Route path="/es"            element={<HomePage locale="es" />} />
          <Route path="/es/audit"      element={<AuditPage locale="es" />} />
          <Route path="/es/report/:id" element={<ReportPage locale="es" />} />
          <Route path="/es/privacidad" element={<PrivacyPage locale="es" />} />
          <Route path="/es/terminos"   element={<TermsPage locale="es" />} />
          <Route path="/es/bots"       element={<BotsPage locale="es" />} />
          <Route path="/es/bots/:id"   element={<BotDetailsPage locale="es" />} />

          {/* English routes under /en */}
          <Route path="/en"            element={<HomePage locale="en" />} />
          <Route path="/en/audit"      element={<AuditPage locale="en" />} />
          <Route path="/en/report/:id" element={<ReportPage locale="en" />} />
          <Route path="/en/privacy"    element={<PrivacyPage locale="en" />} />
          <Route path="/en/terms"      element={<TermsPage locale="en" />} />
          <Route path="/en/bots"       element={<BotsPage locale="en" />} />
          <Route path="/en/bots/:id"   element={<BotDetailsPage locale="en" />} />

          <Route path="/privacy"       element={<PrivacyPage locale="es" />} />
          <Route path="/terms"         element={<TermsPage locale="es" />} />
          <Route path="/audit"         element={<AuditPage locale="es" />} />
          <Route path="/report/:id"    element={<ReportPage locale="es" />} />
          <Route path="/bots"          element={<BotsPage locale="es" />} />
          <Route path="/bots/:id"      element={<BotDetailsPage locale="es" />} />
        </Route>

        {/* ── Login (sin Layout) ───────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── /admin (protegido — antes era público, ver auditoría de seguridad) ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* ── RIWEB Admin Dashboard (protegido) ────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="bots" replace />} />
          <Route path="bots"    element={<MisBotsPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="bot"     element={<BotPage />} />
          <Route path="leads"          element={<LeadsPage />} />
          <Route path="tickets"        element={<TicketsPage />} />
          <Route path="proyectos"      element={<ProyectosPage />} />
          <Route path="subscriptions"  element={<SubscriptionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

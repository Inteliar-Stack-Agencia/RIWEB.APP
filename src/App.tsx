import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import AuditPage from "./pages/AuditPage";
import BotDetailsPage from "./pages/BotDetailsPage";
import BotsPage from "./pages/BotsPage";
import HomePage from "./pages/HomePage";
import ReportPage from "./pages/ReportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage locale="en" />} />
        <Route path="/es" element={<HomePage locale="es" />} />

        <Route path="/audit" element={<AuditPage locale="en" />} />
        <Route path="/es/audit" element={<AuditPage locale="es" />} />

        <Route path="/bots" element={<BotsPage locale="en" />} />
        <Route path="/es/bots" element={<BotsPage locale="es" />} />

        <Route path="/bots/:id" element={<BotDetailsPage locale="en" />} />
        <Route path="/es/bots/:id" element={<BotDetailsPage locale="es" />} />

        <Route path="/report/:id" element={<ReportPage locale="en" />} />
        <Route path="/es/report/:id" element={<ReportPage locale="es" />} />

        <Route path="/privacy" element={<PrivacyPage locale="en" />} />
        <Route path="/es/privacidad" element={<PrivacyPage locale="es" />} />

        <Route path="/terms" element={<TermsPage locale="en" />} />
        <Route path="/es/terminos" element={<TermsPage locale="es" />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

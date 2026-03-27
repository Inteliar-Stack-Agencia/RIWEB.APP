import type { Locale } from "../types";

export default function TermsPage({ locale }: { locale: Locale }) {
  const es = locale === "es";
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
        {es ? "Términos de Servicio" : "Terms of Service"}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginBottom: "2rem" }}>
        {es ? "Última actualización: marzo 2026" : "Last updated: March 2026"}
      </p>

      {(es ? [
        {
          title: "1. Aceptación de los términos",
          body: "Al usar RIWEB.APP aceptás estos términos. Si no estás de acuerdo, no uses el servicio.",
        },
        {
          title: "2. Descripción del servicio",
          body: "RIWEB.APP es una plataforma de Inteliar Stack que ofrece desarrollo de sitios web, bots de WhatsApp con IA y sistemas de gestión a medida para negocios. La herramienta de auditoría pública es gratuita y de uso informativo.",
        },
        {
          title: "3. Uso permitido",
          body: "El servicio es para uso legítimo de negocios. Queda prohibido usar la herramienta de auditoría para fines maliciosos, hacer scraping masivo o intentar vulnerar la seguridad del sistema.",
        },
        {
          title: "4. Proyectos y pagos",
          body: "Los proyectos de desarrollo se contratan mediante acuerdo escrito. Los términos específicos de cada proyecto (precio, plazo, entregables) se definen en el contrato individual.",
        },
        {
          title: "5. Propiedad intelectual",
          body: "El código, diseño y contenidos de RIWEB.APP son propiedad de Inteliar Stack. El software desarrollado a medida para el cliente pasa a ser propiedad del cliente una vez abonado en su totalidad.",
        },
        {
          title: "6. Limitación de responsabilidad",
          body: "La herramienta de auditoría proporciona análisis automáticos de referencia. Inteliar Stack no se responsabiliza por decisiones tomadas en base exclusiva a estos resultados.",
        },
        {
          title: "7. Modificaciones",
          body: "Podemos actualizar estos términos en cualquier momento. La versión vigente siempre estará en esta página.",
        },
        {
          title: "8. Contacto",
          body: "Para consultas sobre estos términos escribinos por WhatsApp al +54 9 11 6568 9145.",
        },
      ] : [
        {
          title: "1. Acceptance of terms",
          body: "By using RIWEB.APP you accept these terms. If you disagree, do not use the service.",
        },
        {
          title: "2. Service description",
          body: "RIWEB.APP is an Inteliar Stack platform offering website development, AI WhatsApp bots and custom management systems for businesses. The public audit tool is free and for informational use.",
        },
        {
          title: "3. Permitted use",
          body: "The service is for legitimate business use. It is prohibited to use the audit tool for malicious purposes, mass scraping or attempting to breach system security.",
        },
        {
          title: "4. Projects and payments",
          body: "Development projects are contracted via written agreement. Specific terms for each project (price, timeline, deliverables) are defined in the individual contract.",
        },
        {
          title: "5. Intellectual property",
          body: "The code, design and content of RIWEB.APP are the property of Inteliar Stack. Custom-developed software becomes the client's property once fully paid.",
        },
        {
          title: "6. Limitation of liability",
          body: "The audit tool provides automated reference analysis. Inteliar Stack is not responsible for decisions made based solely on these results.",
        },
        {
          title: "7. Modifications",
          body: "We may update these terms at any time. The current version will always be on this page.",
        },
        {
          title: "8. Contact",
          body: "For questions about these terms contact us on WhatsApp at +54 9 11 6568 9145.",
        },
      ]).map(s => (
        <div key={s.title} style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.35rem", color: "#f59e0b" }}>{s.title}</h2>
          <p style={{ color: "rgba(255,255,255,0.65)", margin: 0 }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

import type { Locale } from "../types";

export default function PrivacyPage({ locale }: { locale: Locale }) {
  const es = locale === "es";
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
        {es ? "Política de Privacidad" : "Privacy Policy"}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", marginBottom: "2rem" }}>
        {es ? "Última actualización: marzo 2026" : "Last updated: March 2026"}
      </p>

      {(es ? [
        {
          title: "1. Información que recopilamos",
          body: "Recopilamos únicamente la información que vos nos proporcionás directamente: nombre, email, número de WhatsApp y la URL de tu sitio web cuando usás nuestra herramienta de auditoría. No recopilamos datos sensibles ni información de tarjetas de crédito.",
        },
        {
          title: "2. Cómo usamos tu información",
          body: "Usamos tu información para contactarte, enviarte el análisis de tu sitio web y ofrecerte nuestros servicios. No vendemos ni compartimos tus datos con terceros con fines comerciales.",
        },
        {
          title: "3. Cookies y rastreo",
          body: "Podemos usar cookies técnicas necesarias para el funcionamiento del sitio. No usamos cookies de rastreo publicitario de terceros.",
        },
        {
          title: "4. Almacenamiento de datos",
          body: "Tus datos se almacenan de forma segura en servidores de Supabase con encriptación en tránsito y en reposo. Solo accede el equipo de Inteliar Stack.",
        },
        {
          title: "5. Tus derechos",
          body: "Podés solicitar en cualquier momento la eliminación, corrección o exportación de tus datos escribiéndonos por WhatsApp o al correo de contacto.",
        },
        {
          title: "6. Contacto",
          body: "Para consultas sobre privacidad contactanos por WhatsApp al +54 9 11 6568 9145 o vía el formulario en riweb.app.",
        },
      ] : [
        {
          title: "1. Information we collect",
          body: "We collect only the information you directly provide us: name, email, WhatsApp number, and your website URL when using our audit tool. We do not collect sensitive data or credit card information.",
        },
        {
          title: "2. How we use your information",
          body: "We use your information to contact you, send your website analysis and offer our services. We do not sell or share your data with third parties for commercial purposes.",
        },
        {
          title: "3. Cookies and tracking",
          body: "We may use technical cookies necessary for the site to function. We do not use third-party advertising tracking cookies.",
        },
        {
          title: "4. Data storage",
          body: "Your data is stored securely on Supabase servers with encryption in transit and at rest. Only the Inteliar Stack team has access.",
        },
        {
          title: "5. Your rights",
          body: "You may request deletion, correction or export of your data at any time by contacting us via WhatsApp or email.",
        },
        {
          title: "6. Contact",
          body: "For privacy inquiries contact us on WhatsApp at +54 9 11 6568 9145 or via the form at riweb.app.",
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

import type { Locale } from "../types";

export default function TermsPage({ locale }: { locale: Locale }) {
  const isEs = locale === "es";

  return (
    <section className="landing-shell" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>{isEs ? "Términos de Servicio" : "Terms of Service"}</h1>

      {isEs ? (
        <>
          <p>Al usar <strong>RIWEB.APP</strong> aceptás estos términos de servicio.</p>

          <h2>Servicios</h2>
          <p>RIWEB.APP provee servicios de desarrollo web, bots de IA para WhatsApp y auditoría de sitios web. Cada proyecto se personaliza según las necesidades del cliente.</p>

          <h2>Uso aceptable</h2>
          <ul>
            <li>No usar nuestros servicios para actividades ilegales.</li>
            <li>No intentar acceder a sistemas sin autorización.</li>
            <li>No enviar contenido malicioso a través de nuestros bots.</li>
          </ul>

          <h2>Propiedad intelectual</h2>
          <p>El código desarrollado para cada cliente es propiedad del cliente una vez completado el pago. Las herramientas y frameworks propios de RIWEB permanecen como propiedad de Inteliar Stack.</p>

          <h2>Limitación de responsabilidad</h2>
          <p>RIWEB.APP no se responsabiliza por pérdidas derivadas del uso de nuestros servicios más allá del monto pagado por el servicio.</p>

          <h2>Contacto</h2>
          <p>Para consultas sobre estos términos, contactanos por WhatsApp o email.</p>
        </>
      ) : (
        <>
          <p>By using <strong>RIWEB.APP</strong> you accept these terms of service.</p>

          <h2>Services</h2>
          <p>RIWEB.APP provides web development, AI WhatsApp bots, and website audit services. Each project is customized to client needs.</p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Do not use our services for illegal activities.</li>
            <li>Do not attempt unauthorized access to systems.</li>
            <li>Do not send malicious content through our bots.</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>Code developed for each client is owned by the client once payment is complete. RIWEB's proprietary tools and frameworks remain the property of Inteliar Stack.</p>

          <h2>Limitation of liability</h2>
          <p>RIWEB.APP is not liable for losses resulting from the use of our services beyond the amount paid for the service.</p>

          <h2>Contact</h2>
          <p>For questions about these terms, contact us via WhatsApp or email.</p>
        </>
      )}
    </section>
  );
}

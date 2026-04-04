import type { Locale } from "../types";

export default function PrivacyPage({ locale }: { locale: Locale }) {
  const isEs = locale === "es";

  return (
    <section className="landing-shell" style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>{isEs ? "Política de Privacidad" : "Privacy Policy"}</h1>

      {isEs ? (
        <>
          <p>En <strong>RIWEB.APP</strong> nos tomamos tu privacidad en serio. Esta política describe qué datos recopilamos, cómo los usamos y cómo los protegemos.</p>

          <h2>Datos que recopilamos</h2>
          <ul>
            <li>Información de contacto (nombre, email, teléfono) proporcionada voluntariamente.</li>
            <li>URLs de sitios web enviadas para auditoría.</li>
            <li>Datos de uso del sitio (páginas visitadas, tiempo de permanencia).</li>
          </ul>

          <h2>Cómo usamos tus datos</h2>
          <ul>
            <li>Para proveer nuestros servicios de auditoría web y bots de IA.</li>
            <li>Para comunicarnos con vos sobre nuestros servicios.</li>
            <li>Para mejorar nuestra plataforma y experiencia de usuario.</li>
          </ul>

          <h2>Protección de datos</h2>
          <p>Utilizamos encriptación SSL y prácticas de seguridad estándar de la industria para proteger tus datos.</p>

          <h2>Contacto</h2>
          <p>Si tenés preguntas sobre esta política, contactanos por WhatsApp o email.</p>
        </>
      ) : (
        <>
          <p>At <strong>RIWEB.APP</strong> we take your privacy seriously. This policy describes what data we collect, how we use it, and how we protect it.</p>

          <h2>Data we collect</h2>
          <ul>
            <li>Contact information (name, email, phone) provided voluntarily.</li>
            <li>Website URLs submitted for audit.</li>
            <li>Site usage data (pages visited, time spent).</li>
          </ul>

          <h2>How we use your data</h2>
          <ul>
            <li>To provide our web audit and AI bot services.</li>
            <li>To communicate with you about our services.</li>
            <li>To improve our platform and user experience.</li>
          </ul>

          <h2>Data protection</h2>
          <p>We use SSL encryption and industry-standard security practices to protect your data.</p>

          <h2>Contact</h2>
          <p>If you have questions about this policy, contact us via WhatsApp or email.</p>
        </>
      )}
    </section>
  );
}

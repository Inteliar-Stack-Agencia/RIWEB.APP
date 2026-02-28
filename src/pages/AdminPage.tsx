export default function AdminPage() {
  return (
    <div className="card">
      <h2>Admin</h2>
      <p className="muted">Siguiente paso: conectar Supabase Auth para acceso admin real.</p>
      <p>La base de datos y políticas RLS ya están definidas en <code>supabase/schema.sql</code>.</p>
    </div>
  );
}

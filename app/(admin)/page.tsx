import ProtectedRoute from '../../src/routes/ProtectedRoute';

function AdminPageContent() {
  return (
    <div>
      <h1>Admin</h1>
      <div>Admin-only views (users, time, reports) will appear here.</div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <AdminPageContent />
    </ProtectedRoute>
  );
}

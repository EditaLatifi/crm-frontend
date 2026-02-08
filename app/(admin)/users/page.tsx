import ProtectedRoute from '../../../src/routes/ProtectedRoute';

function UsersAdminPageContent() {
  return (
    <div>
      <h1>Admin: Users</h1>
      <div>User management table will appear here.</div>
    </div>
  );
}

export default function UsersAdminPage() {
  return (
    <ProtectedRoute role="ADMIN">
      <UsersAdminPageContent />
    </ProtectedRoute>
  );
}

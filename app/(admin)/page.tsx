import { redirect } from 'next/navigation';

// Root URL: there is no standalone landing page. Send everyone to the dashboard,
// which itself handles auth (redirects to /login when not authenticated).
export default function RootPage() {
  redirect('/dashboard');
}

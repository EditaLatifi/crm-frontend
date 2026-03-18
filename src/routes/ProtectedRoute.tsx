"use client";
// src/routes/ProtectedRoute.tsx
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  role?: 'ADMIN' | 'USER';
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (role && user.role !== role) router.replace('/no-access');
  }, [user, loading, role, router]);

  // Still checking or redirecting — render nothing (no flash of "Loading..." text)
  if (loading || !user || (role && user.role !== role)) return null;

  return <>{children}</>;
}

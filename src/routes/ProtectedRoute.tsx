"use client";
// src/routes/ProtectedRoute.tsx
import { useAuth } from '../auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  role?: 'ADMIN' | 'USER'; // if provided, restrict to this role
};

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (role && user.role !== role) {
        router.replace('/no-access');
      }
    }
  }, [user, loading, role, router]);

  if (loading || !user || (role && user.role !== role)) {
    return <div className="flex items-center justify-center h-full text-lg">Loading...</div>;
  }
  return <>{children}</>;
}

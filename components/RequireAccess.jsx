import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function RequireAccess() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (isAdmin) {
      setStatus('granted');
      return;
    }

    let active = true;

    const check = async () => {
      const page = await base44.entities.Order.filter(
        { status: 'paid', created_by_id: user?.id },
        { limit: 1 },
      );
      if (active) setStatus((page.items || []).length > 0 ? 'granted' : 'denied');
    };

    setStatus('loading');
    check();

    const unsubscribe = base44.entities.Order.subscribe(() => check());

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isAdmin, user?.id]);


  if (isAdmin) return <Outlet />;

  if (status === 'loading') {
    return (
      <div className="grid h-full place-items-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-primary" />
      </div>
    );
  }

  if (status === 'denied') return <Navigate to="/acesso" replace />;

  return <Outlet />;
}
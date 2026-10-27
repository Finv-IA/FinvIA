import { NavLink, Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import {
  MessageCircle,
  LayoutDashboard,
  Receipt,
  Target,
  CreditCard,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/lib/config';

const NAV = [
  { to: '/', label: 'Conversa', icon: MessageCircle, end: true },
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/transacoes', label: 'Transações', icon: Receipt },
  { to: '/metas', label: 'Metas', icon: Target },
  { to: '/acesso', label: 'Meu acesso', icon: CreditCard },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const items = isAdmin
    ? [...NAV, { to: '/admin', label: 'Admin', icon: ShieldCheck }]
    : NAV;
  const initial = (user?.full_name || user?.email || 'F').charAt(0).toUpperCase();

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r hairline bg-white/50 px-4 py-7 backdrop-blur-sm lg:flex">
        <Link to="/" className="flex items-baseline gap-1.5 px-2">
          <span className="display text-[32px] leading-none">{APP_NAME}</span>
          <span className="mb-1 h-1.5 w-1.5 rounded-full bg-accent" />
        </Link>
        <p className="mt-2 px-2 text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
          {APP_TAGLINE}
        </p>

        <nav className="mt-9 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_6px_18px_-10px_rgba(15,45,36,0.9)]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-3 rounded-2xl border hairline bg-white px-3 py-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-medium">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{user?.full_name || 'Sua conta'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              aria-label="Sair"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b hairline bg-white/60 px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/" className="flex items-baseline gap-1.5">
            <span className="display text-2xl leading-none">{APP_NAME}</span>
            <span className="mb-0.5 h-1 w-1 rounded-full bg-accent" />
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" aria-label="Admin" className="text-muted-foreground">
                <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
            <button onClick={() => logout()} aria-label="Sair" className="text-muted-foreground">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>

        <nav className="grid grid-cols-5 border-t hairline bg-white/85 backdrop-blur lg:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
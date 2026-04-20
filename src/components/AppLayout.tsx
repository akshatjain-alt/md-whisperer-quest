import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useNavShortcuts } from '@/hooks/useNavShortcuts';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Menu, Bell, User, LogOut, Settings,
  AlertTriangle, FileText, Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { NAV_BY_ROLE, ROLE_THEME } from '@/config/navigation';
import type { UserRole } from '@/types/auth';
import CommandPalette from '@/components/CommandPalette';
import ShortcutsDialog from '@/components/ShortcutsDialog';
import apiService from '@/lib/api';

type Notification = {
  id: string;
  text: string;
  time: string;
  icon: typeof Bell;
  tone: 'warning' | 'info' | 'destructive';
  to?: string;
};

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const TONE_CLASS: Record<Notification['tone'], string> = {
  warning: 'text-warning',
  info: 'text-role-viewer',
  destructive: 'text-destructive',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Global G+D / G+P / G+S / N / H sequence shortcuts.
  useNavShortcuts();

  // Notification read-state persisted in localStorage so the dot only fires for new IDs.
  const READ_KEY = 'skb.readNotifications';
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const persistRead = (next: Set<string>) => {
    setReadIds(next);
    try {
      // Cap to last 200 to avoid unbounded growth.
      const arr = Array.from(next).slice(-200);
      localStorage.setItem(READ_KEY, JSON.stringify(arr));
    } catch {
      /* ignore quota errors */
    }
  };

  // Resolve role + nav items + theme. Falls back to viewer for unknown roles.
  const role: UserRole = (user?.role as UserRole) || 'viewer';
  const navItems = NAV_BY_ROLE[role] ?? [];
  const theme = ROLE_THEME[role];

  // Live notifications: low-stock products, recent prescriptions, new diagnoses.
  const { data: products = [] } = useQuery({
    queryKey: ['notif-products'],
    queryFn: async () => {
      try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; }
    },
    staleTime: 60_000,
  });
  const { data: prescriptions = [] } = useQuery({
    queryKey: ['notif-prescriptions'],
    queryFn: async () => {
      try { const r = await apiService.get('/prescriptions'); return r.data?.data || []; } catch { return []; }
    },
    staleTime: 60_000,
  });
  const { data: diagnoses = [] } = useQuery({
    queryKey: ['notif-diagnoses'],
    queryFn: async () => {
      try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; }
    },
    staleTime: 60_000,
  });

  const notifications: Notification[] = [
    ...products
      .filter((p: any) => typeof p.stock_quantity === 'number' && p.stock_quantity <= 10)
      .slice(0, 3)
      .map((p: any) => ({
        id: `stock-${p.id}`,
        text: `Low stock: ${p.product_name} (${p.stock_quantity})`,
        time: 'Now',
        icon: AlertTriangle,
        tone: 'warning' as const,
        to: '/expert/products',
      })),
    ...[...prescriptions]
      .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 3)
      .map((pr: any) => ({
        id: `pres-${pr.id}`,
        text: `New prescription #${pr.id}`,
        time: timeAgo(pr.created_at),
        icon: FileText,
        tone: 'info' as const,
        to: `/agent/prescription/${pr.id}/print`,
      })),
    ...[...diagnoses]
      .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))
      .slice(0, 2)
      .map((d: any) => ({
        id: `diag-${d.id}`,
        text: `New diagnosis: ${d.diagnosis_name}`,
        time: timeAgo(d.created_at),
        icon: Stethoscope,
        tone: 'destructive' as const,
        to: role === 'viewer' ? `/viewer/diseases/${d.id}` : '/expert/diagnoses',
      })),
  ];
  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds]
  );
  const hasUnread = unreadCount > 0;

  const markAllRead = () => {
    if (notifications.length === 0) return;
    const next = new Set(readIds);
    notifications.forEach((n) => next.add(n.id));
    persistRead(next);
  };
  const markRead = (id: string) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    persistRead(next);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const target = role === 'viewer' ? '/viewer/search' : '/search';
      navigate(`${target}?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      const parts = user.full_name.split(' ');
      return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
    }
    return user.username[0].toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <span className={`text-2xl ${theme.accent}`}>🌾</span>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-primary leading-tight">Smart Kisan Bharat</h1>
            <p className="text-xs text-sidebar-muted capitalize">{theme.label} workspace</p>
          </div>
        )}
      </div>
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? `bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-current ${theme.accent}`
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`
            }
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-2 py-3 space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-bold text-sidebar-foreground truncate">{user.full_name}</p>
            <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${theme.badge}`}>
              {role.toUpperCase()}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-destructive w-full transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar transition-all duration-200 relative ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-5 -right-3 z-10 hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </Button>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Input
              placeholder="Search across all data..."
              className="h-9 bg-muted/50 border-0 pr-16"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell size={18} />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Notifications
                    {hasUnread && (
                      <Badge variant="secondary" className="text-[10px]">{unreadCount} new</Badge>
                    )}
                  </span>
                  {hasUnread && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAllRead(); }}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    You're all caught up.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = n.icon;
                    const isRead = readIds.has(n.id);
                    return (
                      <DropdownMenuItem
                        key={n.id}
                        onClick={() => { markRead(n.id); if (n.to) navigate(n.to); }}
                        className={`flex items-start gap-3 py-3 cursor-pointer ${isRead ? 'opacity-60' : ''}`}
                      >
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${TONE_CLASS[n.tone]}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${isRead ? 'font-normal' : 'font-medium'}`}>{n.text}</p>
                          {n.time && (
                            <p className="text-xs text-muted-foreground">{n.time}</p>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Profile menu">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white`}
                       style={{ background: `hsl(var(--role-${role}))` }}>
                    {getUserInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge className={`mt-1 w-fit ${theme.badge}`}>{role.toUpperCase()}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto ${theme.pageBg}`}>
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <ShortcutsDialog />
    </div>
  );
}

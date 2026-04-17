import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Sprout, Dna, Search, Stethoscope, Link2, Pill, ClipboardList,
  ChevronLeft, ChevronRight, Menu, Bell, User, LogOut, Settings,
  Package, DollarSign, ShoppingCart, Store, Users as UsersIcon
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

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'agent', 'expert', 'viewer', 'manager'] },
  
  // Agent Menu
  { path: '/prescription', label: 'New Prescription', icon: ClipboardList, roles: ['agent'] },
  { path: '/history', label: 'History', icon: User, roles: ['agent'] },
  
  // Admin Analytics Suite
  { path: '/admin/products', label: 'Product Analysis', icon: Package, roles: ['admin'] },
  { path: '/admin/reports', label: 'Financial Reports', icon: DollarSign, roles: ['admin'] },
  { path: '/admin/transactions', label: 'Transactions', icon: ShoppingCart, roles: ['admin'] },
  { path: '/admin/shops', label: 'Shop Comparison', icon: Store, roles: ['admin'] },
  { path: '/admin/management', label: 'Shop & Managers', icon: UsersIcon, roles: ['admin'] },
  { path: '/users', label: 'User Management', icon: User, roles: ['admin'] },
  
  // Expert Data Management (hidden from admin)
  { path: '/crops', label: 'Crops', icon: Sprout, roles: ['expert'] },
  { path: '/varieties', label: 'Varieties', icon: Dna, roles: ['expert'] },
  { path: '/symptoms', label: 'Symptoms', icon: Search, roles: ['expert'] },
  { path: '/diagnoses', label: 'Diagnoses', icon: Stethoscope, roles: ['expert'] },
  { path: '/products', label: 'Products', icon: Pill, roles: ['expert'] },
  { path: '/mappings', label: 'Mappings', icon: Link2, roles: ['expert'] },
  { path: '/prescriptions', label: 'Prescriptions', icon: ClipboardList, roles: ['expert'] },
];

// Mock recent activities - you can replace this with real data from API
const RECENT_ACTIVITIES = [
  { id: 1, text: 'Admin added Wheat crop', time: '2 min ago' },
  { id: 2, text: 'Admin added Cotton crop', time: '5 min ago' },
  { id: 3, text: 'Admin added Rice crop', time: '10 min ago' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // All roles get sidebar with their specific menu items

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results with query parameter
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      const names = user.full_name.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return names[0][0];
    }
    return user.username[0].toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'expert':
        return 'bg-blue-100 text-blue-700';
      case 'agent':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <span className="text-2xl">🌾</span>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-primary leading-tight">Smart Kisan Bharat</h1>
            <p className="text-xs text-sidebar-muted">Crop Clinic Admin</p>
          </div>
        )}
      </div>
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.filter(item => !item.roles || (user && item.roles.includes(user.role))).map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-2 py-3 space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-bold text-sidebar-foreground">{user.full_name}</p>
            <p className="text-xs text-sidebar-muted">{user.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
              {user.role.toUpperCase()}
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
      {/* Desktop Sidebar - Universal for all roles */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-5 left-auto hidden lg:flex items-center justify-center w-6 h-6 rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground"
          style={{ left: collapsed ? 52 : 248 }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Overlay - Universal for all roles */}
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
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </Button>
          
          {/* Search Bar for all roles */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <Input 
              placeholder="Search across all data..." 
              className="h-9 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          {/* Right side - Notifications and Profile */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-bold">Recent Activity</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {RECENT_ACTIVITIES.map((activity) => (
                  <DropdownMenuItem key={activity.id} className="flex flex-col items-start py-3">
                    <span className="text-sm font-medium">{activity.text}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm font-medium text-primary">
                  View all activity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {getUserInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <Badge className={`mt-1 w-fit ${getRoleBadgeColor(user?.role || '')}`}>
                      {user?.role.toUpperCase()}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
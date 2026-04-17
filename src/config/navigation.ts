// Centralized navigation config + role theming. Used by AppLayout sidebar.
import {
  LayoutDashboard, Sprout, Dna, Search, Stethoscope, Link2, Pill, ClipboardList,
  Package, DollarSign, ShoppingCart, Store, Users as UsersIcon, Target,
  Boxes, BookOpen, BookMarked, Bug, Library, History as HistoryIcon, FilePlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types/auth';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Product Analysis', icon: Package },
    { path: '/admin/reports', label: 'Financial Reports', icon: DollarSign },
    { path: '/admin/transactions', label: 'Transactions', icon: ShoppingCart },
    { path: '/admin/shops', label: 'Shop Comparison', icon: Store },
    { path: '/admin/management', label: 'Shops & Managers', icon: UsersIcon },
    { path: '/admin/users', label: 'User Management', icon: UsersIcon },
  ],
  manager: [
    { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/agents', label: 'My Agents', icon: UsersIcon },
    { path: '/manager/inventory', label: 'Inventory', icon: Boxes },
    { path: '/manager/targets', label: 'Targets', icon: Target },
  ],
  agent: [
    { path: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/agent/prescription', label: 'New Prescription', icon: FilePlus },
    { path: '/agent/history', label: 'History', icon: HistoryIcon },
  ],
  expert: [
    { path: '/expert/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/expert/crops', label: 'Crops', icon: Sprout },
    { path: '/expert/varieties', label: 'Varieties', icon: Dna },
    { path: '/expert/symptoms', label: 'Symptoms', icon: Search },
    { path: '/expert/diagnoses', label: 'Diagnoses', icon: Stethoscope },
    { path: '/expert/products', label: 'Products', icon: Pill },
    { path: '/expert/mappings', label: 'Mappings', icon: Link2 },
    { path: '/expert/prescriptions', label: 'Prescriptions', icon: ClipboardList },
  ],
  viewer: [
    { path: '/viewer/browse', label: 'Browse', icon: Library },
    { path: '/viewer/crops', label: 'Crops', icon: Sprout },
    { path: '/viewer/diseases', label: 'Diseases', icon: Bug },
    { path: '/viewer/products', label: 'Products', icon: Pill },
    { path: '/viewer/search', label: 'Search', icon: Search },
  ],
};

// Default landing route for each role after login
export const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  manager: '/manager/dashboard',
  agent: '/agent/dashboard',
  expert: '/expert/dashboard',
  viewer: '/viewer/browse',
};

export const ROLE_THEME: Record<UserRole, {
  accent: string;        // tailwind text class for sidebar active accent
  badge: string;         // tailwind classes for role badge
  pageBg: string;        // body gradient class
  ring: string;          // focus ring class
  label: string;         // human-readable label
}> = {
  admin:   { accent: 'text-role-admin',   badge: 'bg-role-admin-soft text-role-admin',     pageBg: 'bg-role-admin',   ring: 'ring-role-admin',   label: 'Admin' },
  manager: { accent: 'text-role-manager', badge: 'bg-role-manager-soft text-role-manager', pageBg: 'bg-role-manager', ring: 'ring-role-manager', label: 'Manager' },
  agent:   { accent: 'text-role-agent',   badge: 'bg-role-agent-soft text-role-agent',     pageBg: 'bg-role-agent',   ring: 'ring-role-agent',   label: 'Agent' },
  expert:  { accent: 'text-role-expert',  badge: 'bg-role-expert-soft text-role-expert',   pageBg: 'bg-role-expert',  ring: 'ring-role-expert',  label: 'Expert' },
  viewer:  { accent: 'text-role-viewer',  badge: 'bg-role-viewer-soft text-role-viewer',   pageBg: 'bg-role-viewer',  ring: 'ring-role-viewer',  label: 'Viewer' },
};

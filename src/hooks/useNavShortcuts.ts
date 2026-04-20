import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_ROUTE_BY_ROLE } from '@/config/navigation';
import type { UserRole } from '@/types/auth';

/**
 * Global navigation shortcuts (vim/Linear-style sequences):
 *   G then D → Dashboard (role default)
 *   G then P → Profile
 *   G then S → Settings
 *   N       → Agent: new prescription
 *   H       → Agent: history
 *
 * Matches the keys advertised in <ShortcutsDialog />.
 * Ignores keystrokes while typing in inputs/textareas/contentEditable.
 */
export function useNavShortcuts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: UserRole = (user?.role as UserRole) || 'viewer';

  // Tracks whether the previous key was "g" (within 1 second).
  const gPending = useRef<number | null>(null);

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      const tag = node?.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || !!(node as any)?.isContentEditable;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;

      const k = e.key.toLowerCase();

      // G-prefix sequences
      if (gPending.current && Date.now() - gPending.current < 1000) {
        gPending.current = null;
        if (k === 'd') { e.preventDefault(); navigate(DEFAULT_ROUTE_BY_ROLE[role]); return; }
        if (k === 'p') { e.preventDefault(); navigate('/profile'); return; }
        if (k === 's') { e.preventDefault(); navigate('/settings'); return; }
        return;
      }

      if (k === 'g') {
        gPending.current = Date.now();
        return;
      }

      // Single-key shortcuts (agent-only to avoid surprises elsewhere)
      if (role === 'agent') {
        if (k === 'n') { e.preventDefault(); navigate('/agent/prescription'); return; }
        if (k === 'h') { e.preventDefault(); navigate('/agent/history'); return; }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, role]);
}

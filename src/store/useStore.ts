// Lightweight client-side store retained for mock/demo flows that
// don't talk to the backend. Most pages now use react-query against the API.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    { name: 'crop-clinic-ui' }
  )
);

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Sprout, Bug, Pill, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NAV_BY_ROLE } from '@/config/navigation';
import { apiService } from '@/lib/api';
import type { UserRole } from '@/types/auth';

// Global ⌘K palette: searches navigation, crops, diseases, products.
// Routes to viewer wiki pages for viewers, expert pages otherwise.
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: UserRole = (user?.role as UserRole) || 'viewer';
  const navItems = NAV_BY_ROLE[role] ?? [];

  // ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lazy-load entities only when palette opens
  const { data: crops = [] } = useQuery({
    enabled: open,
    queryKey: ['cmdk', 'crops'],
    queryFn: async () => {
      try { return await apiService.getCrops(); } catch { return []; }
    },
  });
  const { data: diseases = [] } = useQuery({
    enabled: open,
    queryKey: ['cmdk', 'diagnoses'],
    queryFn: async () => {
      try { return await apiService.getAll('diagnoses'); } catch { return []; }
    },
  });
  const { data: products = [] } = useQuery({
    enabled: open,
    queryKey: ['cmdk', 'products'],
    queryFn: async () => {
      try { return await apiService.getAll('products'); } catch { return []; }
    },
  });

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const entityBase = role === 'viewer' ? '/viewer' : '/expert';

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, crops, diseases, products…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navItems.map((item) => (
            <CommandItem
              key={item.path}
              value={`nav ${item.label}`}
              onSelect={() => go(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              <ArrowRight className="ml-auto h-3 w-3 opacity-50" />
            </CommandItem>
          ))}
        </CommandGroup>

        {Array.isArray(crops) && crops.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Crops">
              {crops.slice(0, 8).map((c: any) => (
                <CommandItem
                  key={`crop-${c.id}`}
                  value={`crop ${c.name ?? c.crop_name ?? ''}`}
                  onSelect={() => go(`${entityBase}/crops${role === 'viewer' ? `/${c.id}` : ''}`)}
                >
                  <Sprout className="mr-2 h-4 w-4 text-role-expert" />
                  <span>{c.name ?? c.crop_name ?? `Crop #${c.id}`}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {Array.isArray(diseases) && diseases.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Diseases">
              {diseases.slice(0, 8).map((d: any) => (
                <CommandItem
                  key={`dis-${d.id}`}
                  value={`disease ${d.name ?? d.disease_name ?? ''}`}
                  onSelect={() =>
                    go(role === 'viewer' ? `/viewer/diseases/${d.id}` : `/expert/diagnoses`)
                  }
                >
                  <Bug className="mr-2 h-4 w-4 text-destructive" />
                  <span>{d.name ?? d.disease_name ?? `Diagnosis #${d.id}`}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {Array.isArray(products) && products.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Products">
              {products.slice(0, 8).map((p: any) => (
                <CommandItem
                  key={`prod-${p.id}`}
                  value={`product ${p.name ?? p.product_name ?? ''}`}
                  onSelect={() =>
                    go(role === 'viewer' ? `/viewer/products/${p.id}` : `/expert/products`)
                  }
                >
                  <Pill className="mr-2 h-4 w-4 text-role-agent" />
                  <span>{p.name ?? p.product_name ?? `Product #${p.id}`}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Sprout, Bug, Pill } from 'lucide-react';

export default function ViewerSearch() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  useEffect(() => { setParams(q ? { q } : {}); }, [q]);

  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops().catch(() => []) });
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } } });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => { try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; } } });

  const lower = q.toLowerCase();
  const cropResults = q ? crops.filter((c: any) => (c.name||'').toLowerCase().includes(lower) || (c.local_name||'').toLowerCase().includes(lower)) : [];
  const diseaseResults = q ? diagnoses.filter((d: any) => (d.diagnosis_name||'').toLowerCase().includes(lower) || (d.diagnosis_name_local||'').toLowerCase().includes(lower)) : [];
  const productResults = q ? products.filter((p: any) => (p.product_name||'').toLowerCase().includes(lower) || (p.manufacturer||'').toLowerCase().includes(lower)) : [];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-black">Search the knowledge base</h1>
      </header>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Crops, diseases, products…" className="pl-9 h-11" />
      </div>

      {q && (
        <div className="space-y-6">
          <Section title="Crops" icon={<Sprout className="h-4 w-4 text-role-agent" />} count={cropResults.length}>
            {cropResults.map((c: any) => (
              <Link key={c.id} to={`/viewer/crops/${c.id}`} className="block p-3 rounded border border-border hover:border-role-viewer/40 hover:bg-muted/40 transition-all">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.local_name}</p>
              </Link>
            ))}
          </Section>
          <Section title="Diseases" icon={<Bug className="h-4 w-4 text-destructive" />} count={diseaseResults.length}>
            {diseaseResults.map((d: any) => (
              <Link key={d.id} to={`/viewer/diseases/${d.id}`} className="block p-3 rounded border border-border hover:border-role-viewer/40 hover:bg-muted/40 transition-all">
                <p className="font-medium text-sm">{d.diagnosis_name}</p>
                <p className="text-xs text-muted-foreground">{d.disease_type}</p>
              </Link>
            ))}
          </Section>
          <Section title="Products" icon={<Pill className="h-4 w-4 text-role-admin" />} count={productResults.length}>
            {productResults.map((p: any) => (
              <Link key={p.id} to={`/viewer/products/${p.id}`} className="block p-3 rounded border border-border hover:border-role-viewer/40 hover:bg-muted/40 transition-all">
                <p className="font-medium text-sm">{p.product_name}</p>
                <p className="text-xs text-muted-foreground">{p.manufacturer}</p>
              </Link>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        {icon}<h2 className="font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-xs">{count}</Badge>
      </div>
      <div className="space-y-2">
        {count === 0 ? <p className="text-xs text-muted-foreground">No matches.</p> : children}
      </div>
    </section>
  );
}

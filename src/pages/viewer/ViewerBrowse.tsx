import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sprout, Bug, Pill, BookOpen, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { path: '/viewer/crops',    icon: Sprout,   title: 'Crops',     desc: 'Cereals, pulses, fibers, vegetables and more.' },
  { path: '/viewer/diseases', icon: Bug,      title: 'Diseases',  desc: 'Identify symptoms and learn treatments.' },
  { path: '/viewer/products', icon: Pill,     title: 'Products',  desc: 'Fungicides, insecticides, fertilizers.' },
  { path: '/viewer/search',   icon: BookOpen, title: 'Guides',    desc: 'Best practices and educational articles.' },
];

export default function ViewerBrowse() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops().catch(() => []) });
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } } });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/viewer/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-10">
      <section className="text-center py-10 px-4 rounded-2xl border border-border bg-card">
        <p className="text-xs uppercase tracking-[0.2em] text-role-viewer font-semibold">Smart Kisan Bharat</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">Agricultural Knowledge Base</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Your complete guide to crop health, diseases and treatment — written for farmers, by experts.
        </p>
        <form onSubmit={onSubmit} className="mt-6 max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search crops, diseases, products…" className="pl-9 h-11" />
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link key={c.path} to={c.path}>
            <Card className="h-full hover:shadow-lg hover:border-role-viewer/40 transition-all">
              <CardContent className="p-5">
                <c.icon className="h-7 w-7 text-role-viewer mb-3" />
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                <p className="text-xs text-role-viewer font-medium mt-3">Browse →</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Featured Crops</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {crops.slice(0, 5).map((c: any) => (
              <Link key={c.id} to={`/viewer/crops/${c.id}`} className="block p-2 rounded hover:bg-muted/60 transition-colors">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.local_name || c.scientific_name}</p>
              </Link>
            ))}
            {crops.length === 0 && <p className="text-sm text-muted-foreground">No crops available.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Common Diseases</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {diagnoses.slice(0, 5).map((d: any) => (
              <Link key={d.id} to={`/viewer/diseases/${d.id}`} className="block p-2 rounded hover:bg-muted/60 transition-colors">
                <p className="font-medium text-sm">{d.diagnosis_name}</p>
                <p className="text-xs text-muted-foreground">{d.disease_type}</p>
              </Link>
            ))}
            {diagnoses.length === 0 && <p className="text-sm text-muted-foreground">No diseases available.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

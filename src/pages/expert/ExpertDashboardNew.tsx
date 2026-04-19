import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Dna, Search, Stethoscope, Pill, Link2, ArrowRight, Clock } from 'lucide-react';

const QUICK_LINKS = [
  { path: '/expert/crops', label: 'Crops', icon: Sprout, color: 'text-role-agent' },
  { path: '/expert/varieties', label: 'Varieties', icon: Dna, color: 'text-role-manager' },
  { path: '/expert/symptoms', label: 'Symptoms', icon: Search, color: 'text-warning' },
  { path: '/expert/diagnoses', label: 'Diagnoses', icon: Stethoscope, color: 'text-destructive' },
  { path: '/expert/products', label: 'Products', icon: Pill, color: 'text-role-admin' },
  { path: '/expert/mappings', label: 'Mappings', icon: Link2, color: 'text-role-expert' },
];

interface ActivityItem { label: string; name: string; date: string; }

function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function ExpertDashboardNew() {
  const navigate = useNavigate();

  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops().catch(() => []) });
  const { data: symptoms = [] } = useQuery({ queryKey: ['symptoms'], queryFn: () => apiService.getSymptoms().catch(() => []) });
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } } });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => { try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; } } });
  const { data: varieties = [] } = useQuery({ queryKey: ['varieties'], queryFn: () => apiService.getAll('varieties').catch(() => []) });
  const { data: mappings = [] } = useQuery({ queryKey: ['mappings'], queryFn: async () => { try { const r = await apiService.get('/mappings'); return r.data?.data || []; } catch { return []; } } });

  const stats = [
    { label: 'Crops', value: crops.length, color: 'border-l-role-agent' },
    { label: 'Varieties', value: varieties.length, color: 'border-l-role-manager' },
    { label: 'Symptoms', value: symptoms.length, color: 'border-l-warning' },
    { label: 'Diagnoses', value: diagnoses.length, color: 'border-l-destructive' },
    { label: 'Products', value: products.length, color: 'border-l-role-admin' },
    { label: 'Mappings', value: mappings.length, color: 'border-l-role-expert' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Maintain the agricultural data powering every diagnosis.</p>
      </header>

      <section className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className={`border-l-4 ${s.color}`}>
            <CardContent className="p-4">
              <p className="text-3xl font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Manage data</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Card key={link.path} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(link.path)}>
              <CardContent className="p-4 flex items-center gap-3">
                <link.icon className={`h-6 w-6 ${link.color}`} />
                <span className="font-medium flex-1">Manage {link.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/expert/crops')}>+ Add Crop</Button>
          <Button variant="outline" onClick={() => navigate('/expert/symptoms')}>+ Add Symptom</Button>
          <Button variant="outline" onClick={() => navigate('/expert/diagnoses')}>+ Add Diagnosis</Button>
          <Button variant="outline" onClick={() => navigate('/expert/products')}>+ Add Product</Button>
          <Button variant="outline" onClick={() => navigate('/expert/prescriptions')}>+ Add Prescription</Button>
        </CardContent>
      </Card>

      <RecentActivity
        crops={crops}
        varieties={varieties}
        symptoms={symptoms}
        diagnoses={diagnoses}
        products={products}
      />
    </div>
  );
}

function RecentActivity({ crops, varieties, symptoms, diagnoses, products }: {
  crops: any[]; varieties: any[]; symptoms: any[]; diagnoses: any[]; products: any[];
}) {
  const items: ActivityItem[] = [
    ...crops.map((c: any) => ({ label: 'Crop', name: c.name, date: c.created_at })),
    ...varieties.map((v: any) => ({ label: 'Variety', name: v.variety_name, date: v.created_at })),
    ...symptoms.map((s: any) => ({ label: 'Symptom', name: s.symptom_name, date: s.created_at })),
    ...diagnoses.map((d: any) => ({ label: 'Diagnosis', name: d.diagnosis_name, date: d.created_at })),
    ...products.map((p: any) => ({ label: 'Product', name: p.product_name, date: p.created_at })),
  ]
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-role-expert" /> Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No recent edits yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-role-expert/10 text-role-expert">
                    {it.label}
                  </span>
                  <span className="truncate font-medium">{it.name}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-3">{timeAgo(it.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

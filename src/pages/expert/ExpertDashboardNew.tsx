import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Dna, Search, Stethoscope, Pill, Link2, ClipboardList, ArrowRight } from 'lucide-react';

const QUICK_LINKS = [
  { path: '/expert/crops', label: 'Crops', icon: Sprout, color: 'text-role-agent' },
  { path: '/expert/varieties', label: 'Varieties', icon: Dna, color: 'text-role-manager' },
  { path: '/expert/symptoms', label: 'Symptoms', icon: Search, color: 'text-warning' },
  { path: '/expert/diagnoses', label: 'Diagnoses', icon: Stethoscope, color: 'text-destructive' },
  { path: '/expert/products', label: 'Products', icon: Pill, color: 'text-role-admin' },
  { path: '/expert/mappings', label: 'Mappings', icon: Link2, color: 'text-role-expert' },
];

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
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Sprout, Dna, Search, Stethoscope, Pill, ClipboardList, Link2, Users } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatsCard from '@/components/StatsCard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { crops, symptoms, diagnoses, products, mappings, prescriptions } = useStore();
  const navigate = useNavigate();

  const stats = [
    { label: 'Crops', value: crops.length, change: 3, icon: Sprout, path: '/crops' },
    { label: 'Varieties', value: 0, change: 0, icon: Dna, path: '/varieties' },
    { label: 'Symptoms', value: symptoms.length, change: 5, icon: Search, path: '/symptoms' },
    { label: 'Diagnoses', value: diagnoses.length, change: 2, icon: Stethoscope, path: '/diagnoses' },
    { label: 'Products', value: products.length, change: 4, icon: Pill, path: '/products' },
    { label: 'Prescriptions', value: prescriptions.length, change: 0, icon: ClipboardList, path: '/prescriptions' },
    { label: 'Mappings', value: mappings.length, change: 0, icon: Link2, path: '/mappings' },
    { label: 'Users', value: 12, change: 1, icon: Users, path: '/' },
  ];

  const quickActions = [
    { label: 'Add New Crop', path: '/crops' },
    { label: 'Add New Symptom', path: '/symptoms' },
    { label: 'Create Diagnosis', path: '/diagnoses' },
    { label: 'Add Product', path: '/products' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your Crop Clinic database</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} onClick={() => navigate(s.path)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" className="h-auto py-3 justify-start" onClick={() => navigate(a.path)}>
                {a.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {crops.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span>Added crop <span className="font-medium text-foreground">{c.name}</span></span>
                <span className="ml-auto text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {symptoms.slice(0, 2).map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                <span>Added symptom <span className="font-medium text-foreground">{s.name}</span></span>
                <span className="ml-auto text-xs">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

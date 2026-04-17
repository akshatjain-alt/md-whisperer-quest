import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bug, Search } from 'lucide-react';
import { useState } from 'react';

export default function ViewerDiseases() {
  const [q, setQ] = useState('');
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } } });
  const filtered = diagnoses.filter((d: any) =>
    !q || d.diagnosis_name?.toLowerCase().includes(q.toLowerCase()) || d.disease_type?.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-black">Diseases</h1>
        <p className="text-muted-foreground text-sm mt-1">Identify, learn and treat common crop diseases.</p>
      </header>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search diseases…" className="pl-9" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d: any) => (
          <Link key={d.id} to={`/viewer/diseases/${d.id}`}>
            <Card className="hover:shadow-md hover:border-role-viewer/40 transition-all h-full">
              <CardContent className="p-4">
                <Bug className="h-6 w-6 text-destructive mb-2" />
                <p className="font-semibold">{d.diagnosis_name}</p>
                {d.diagnosis_name_local && <p className="text-xs text-muted-foreground">{d.diagnosis_name_local}</p>}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {d.disease_type && <Badge variant="outline" className="text-[10px]">{d.disease_type}</Badge>}
                  {d.severity && <Badge variant="secondary" className="text-[10px]">{d.severity}</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No diseases found.</p>}
      </div>
    </div>
  );
}

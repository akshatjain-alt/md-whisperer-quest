import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sprout, Search } from 'lucide-react';
import { useState } from 'react';

export default function ViewerCrops() {
  const [q, setQ] = useState('');
  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops().catch(() => []) });
  const filtered = crops.filter((c: any) =>
    !q || c.name?.toLowerCase().includes(q.toLowerCase()) || c.local_name?.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-black">Crops</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse all crops in the knowledge base.</p>
      </header>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search crops…" className="pl-9" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c: any) => (
          <Link key={c.id} to={`/viewer/crops/${c.id}`}>
            <Card className="hover:shadow-md hover:border-role-viewer/40 transition-all h-full">
              <CardContent className="p-4 flex gap-3">
                <Sprout className="h-8 w-8 text-role-agent shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.local_name || c.scientific_name || c.category}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No crops found.</p>}
      </div>
    </div>
  );
}

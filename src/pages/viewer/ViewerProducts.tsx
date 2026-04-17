import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pill, Search } from 'lucide-react';
import { useState } from 'react';

export default function ViewerProducts() {
  const [q, setQ] = useState('');
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => { try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; } } });
  const filtered = products.filter((p: any) =>
    !q || p.product_name?.toLowerCase().includes(q.toLowerCase()) || p.product_category?.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-black">Products</h1>
        <p className="text-muted-foreground text-sm mt-1">Educational reference — usage, application and safety.</p>
      </header>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-9" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p: any) => (
          <Link key={p.id} to={`/viewer/products/${p.id}`}>
            <Card className="hover:shadow-md hover:border-role-viewer/40 transition-all h-full">
              <CardContent className="p-4">
                <Pill className="h-6 w-6 text-role-admin mb-2" />
                <p className="font-semibold">{p.product_name}</p>
                <p className="text-xs text-muted-foreground">{p.manufacturer || p.active_ingredient}</p>
                {p.product_category && <Badge variant="outline" className="text-[10px] mt-2">{p.product_category}</Badge>}
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No products found.</p>}
      </div>
    </div>
  );
}

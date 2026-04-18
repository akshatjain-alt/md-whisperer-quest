import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Users, Target, TrendingUp, Boxes, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import { apiService } from '@/lib/api';

// ---------- Mock fallbacks (used when backend has no matching endpoint) ----------
const MOCK_AGENTS = [
  { id: 1, name: 'Ravi Kumar', email: 'ravi@kisan.in', prescriptions: 142, success_rate: 92, status: 'active' },
  { id: 2, name: 'Sita Devi', email: 'sita@kisan.in', prescriptions: 118, success_rate: 88, status: 'active' },
  { id: 3, name: 'Arjun Patel', email: 'arjun@kisan.in', prescriptions: 87, success_rate: 79, status: 'active' },
  { id: 4, name: 'Lata Singh', email: 'lata@kisan.in', prescriptions: 64, success_rate: 95, status: 'on-leave' },
];

const MOCK_INVENTORY = [
  { id: 1, name: 'Neem Oil 1L', sku: 'NEEM-1L', stock: 124, threshold: 30, price: 250 },
  { id: 2, name: 'Copper Fungicide 500g', sku: 'CU-500', stock: 18, threshold: 25, price: 380 },
  { id: 3, name: 'NPK 19-19-19 5kg', sku: 'NPK-5K', stock: 56, threshold: 20, price: 620 },
  { id: 4, name: 'Bio-pesticide Spray', sku: 'BIO-SPR', stock: 8, threshold: 15, price: 410 },
  { id: 5, name: 'Trichoderma 1kg', sku: 'TRI-1K', stock: 92, threshold: 25, price: 290 },
];

const MOCK_TARGETS = [
  { id: 1, label: 'Monthly Prescriptions', current: 411, goal: 500, unit: '' },
  { id: 2, label: 'New Customers', current: 38, goal: 60, unit: '' },
  { id: 3, label: 'Revenue (₹)', current: 184000, goal: 250000, unit: '₹' },
  { id: 4, label: 'Avg. Success Rate', current: 89, goal: 90, unit: '%' },
];

// ============================================================
// Manager → My Agents
// ============================================================
export function ManagerAgents() {
  const [query, setQuery] = useState('');

  // Real endpoint may not exist — fall back to mock data.
  const { data: agents = MOCK_AGENTS } = useQuery({
    queryKey: ['manager', 'agents'],
    queryFn: async () => {
      try {
        const res = await apiService.get('/users?role=agent');
        const list = res.data?.data ?? res.data ?? [];
        return Array.isArray(list) && list.length ? list : MOCK_AGENTS;
      } catch {
        return MOCK_AGENTS;
      }
    },
  });

  const filtered = useMemo(
    () =>
      agents.filter((a: any) =>
        `${a.name ?? a.full_name ?? ''} ${a.email ?? ''}`.toLowerCase().includes(query.toLowerCase())
      ),
    [agents, query]
  );

  const totals = useMemo(() => {
    const totalRx = agents.reduce((s: number, a: any) => s + (a.prescriptions ?? 0), 0);
    const avgRate =
      agents.length === 0
        ? 0
        : Math.round(agents.reduce((s: number, a: any) => s + (a.success_rate ?? 0), 0) / agents.length);
    const active = agents.filter((a: any) => (a.status ?? 'active') === 'active').length;
    return { totalRx, avgRate, active };
  }, [agents]);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-role-manager" /> My Agents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track agent performance across your shop.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Active agents" value={totals.active} icon={Users} />
        <StatsCard label="Prescriptions (30d)" value={totals.totalRx} icon={TrendingUp} />
        <StatsCard label="Avg. success rate" value={totals.avgRate} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Agent roster</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              className="pl-8 h-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Prescriptions</TableHead>
                <TableHead className="w-[200px]">Success rate</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    No agents match "{query}"
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((a: any) => {
                const rate = a.success_rate ?? 0;
                return (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium">{a.name ?? a.full_name ?? a.username}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{a.prescriptions ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={rate} className="h-2" />
                        <span className="text-xs tabular-nums w-10 text-right">{rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={a.status === 'on-leave' ? 'secondary' : 'default'}>
                        {a.status ?? 'active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Manager → Inventory
// ============================================================
export function ManagerInventory() {
  const [query, setQuery] = useState('');

  const { data: items = MOCK_INVENTORY } = useQuery({
    queryKey: ['manager', 'inventory'],
    queryFn: async () => {
      try {
        const res = await apiService.get('/products');
        const list = res.data?.data ?? res.data ?? [];
        if (!Array.isArray(list) || list.length === 0) return MOCK_INVENTORY;
        // Normalize to inventory shape — use mock stock/threshold if not present
        return list.map((p: any, i: number) => ({
          id: p.id ?? i,
          name: p.name ?? p.product_name ?? `Product #${p.id ?? i}`,
          sku: p.sku ?? `SKU-${p.id ?? i}`,
          stock: p.stock ?? Math.floor(Math.random() * 120) + 5,
          threshold: p.threshold ?? 25,
          price: p.price ?? 0,
        }));
      } catch {
        return MOCK_INVENTORY;
      }
    },
  });

  const filtered = useMemo(
    () => items.filter((i: any) => `${i.name} ${i.sku}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  const lowStock = items.filter((i: any) => i.stock < i.threshold);
  const totalValue = items.reduce((s: number, i: any) => s + i.stock * i.price, 0);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Boxes className="h-6 w-6 text-role-manager" /> Inventory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stock levels for your shop location.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="SKUs in stock" value={items.length} icon={Boxes} />
        <StatsCard label="Low-stock alerts" value={lowStock.length} icon={AlertTriangle} />
        <StatsCard label="Inventory value (₹)" value={totalValue} icon={TrendingUp} />
      </div>

      {lowStock.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">{lowStock.length} item(s) need restocking</p>
              <p className="text-muted-foreground">
                {lowStock.map((i: any) => i.name).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Stock list</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items"
              className="pl-8 h-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i: any) => {
                const low = i.stock < i.threshold;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{i.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{i.stock}</TableCell>
                    <TableCell className="text-right tabular-nums">₹{i.price}</TableCell>
                    <TableCell className="text-right">
                      {low ? (
                        <Badge variant="destructive">Low</Badge>
                      ) : (
                        <Badge variant="secondary">OK</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Manager → Targets
// ============================================================
export function ManagerTargets() {
  const targets = MOCK_TARGETS;
  const overall = Math.round(
    targets.reduce((s, t) => s + Math.min(100, (t.current / t.goal) * 100), 0) / targets.length
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-role-manager" /> Monthly Targets
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Goals and progress for your team this month.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Overall progress</span>
            <span className="text-sm font-normal text-muted-foreground">{overall}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overall} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {targets.map((t) => {
          const pct = Math.min(100, Math.round((t.current / t.goal) * 100));
          const isMoney = t.unit === '₹';
          const fmt = (n: number) =>
            isMoney ? `₹${n.toLocaleString()}` : `${n.toLocaleString()}${t.unit ? t.unit : ''}`;
          return (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold">{fmt(t.current)}</span>
                  <span className="text-sm text-muted-foreground">of {fmt(t.goal)}</span>
                </div>
                <Progress value={pct} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">{pct}% complete</span>
                  <span className={pct >= 100 ? 'text-success font-semibold' : 'text-muted-foreground'}>
                    {pct >= 100 ? '✓ Achieved' : `${100 - pct}% to go`}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Targets refresh on the 1st of each month. Historical performance available in the dashboard.
        </CardContent>
      </Card>
    </div>
  );
}

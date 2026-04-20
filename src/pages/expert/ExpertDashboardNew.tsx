import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sprout, Dna, Search, Stethoscope, Pill, ArrowRight, Clock,
  BookOpen, AlertTriangle, CheckCircle2,
} from 'lucide-react';

const RESOURCE_LINKS = [
  { path: '/expert/crops',          label: 'Crops',         icon: Sprout,         tone: 'text-role-agent' },
  { path: '/expert/varieties',      label: 'Varieties',     icon: Dna,            tone: 'text-role-manager' },
  { path: '/expert/symptoms',       label: 'Symptoms',      icon: Search,         tone: 'text-warning' },
  { path: '/expert/diagnoses',      label: 'Diagnoses',     icon: Stethoscope,    tone: 'text-destructive' },
  { path: '/expert/products',       label: 'Products',      icon: Pill,           tone: 'text-role-admin' },
];

interface ActivityItem { label: string; name: string; date: string; href: string; }

function timeAgo(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return '';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const safeList = async <T,>(p: Promise<any>): Promise<T[]> => {
  try {
    const r = await p;
    return (r?.data?.data ?? r?.data ?? r ?? []) as T[];
  } catch {
    return [];
  }
};

export default function ExpertDashboardNew() {
  const navigate = useNavigate();

  const { data: crops = [] }         = useQuery({ queryKey: ['crops'],         queryFn: () => apiService.getCrops().catch(() => []) });
  const { data: varieties = [] }     = useQuery({ queryKey: ['varieties'],     queryFn: () => apiService.getAll('varieties').catch(() => []) });
  const { data: symptoms = [] }      = useQuery({ queryKey: ['symptoms'],      queryFn: () => apiService.getSymptoms().catch(() => []) });
  const { data: diagnoses = [] }     = useQuery({ queryKey: ['diagnoses'],     queryFn: () => safeList<any>(apiService.get('/diagnoses')) });
  const { data: products = [] }      = useQuery({ queryKey: ['products'],      queryFn: () => safeList<any>(apiService.get('/products')) });

  const stats = [
    { label: 'Crops',     value: crops.length,     icon: Sprout,      tone: 'text-role-agent',   border: 'border-l-role-agent' },
    { label: 'Varieties', value: varieties.length, icon: Dna,         tone: 'text-role-manager', border: 'border-l-role-manager' },
    { label: 'Symptoms',  value: symptoms.length,  icon: Search,      tone: 'text-warning',      border: 'border-l-warning' },
    { label: 'Diagnoses', value: diagnoses.length, icon: Stethoscope, tone: 'text-destructive',  border: 'border-l-destructive' },
    { label: 'Products',  value: products.length,  icon: Pill,        tone: 'text-role-admin',   border: 'border-l-role-admin' },
  ];

  // Knowledge-base health: spot common gaps experts should fix.
  const health = useMemo(() => {
    const cropsWithoutVarieties = (() => {
      const cropIds = new Set<number>(varieties.map((v: any) => v.crop_id));
      return crops.filter((c: any) => !cropIds.has(c.id));
    })();

    const cropsWithoutSymptoms = (() => {
      const cropIds = new Set<number>(symptoms.map((s: any) => s.crop_id).filter(Boolean));
      return crops.filter((c: any) => !cropIds.has(c.id));
    })();

    return [
      {
        ok: cropsWithoutVarieties.length === 0,
        title: cropsWithoutVarieties.length === 0 ? 'Every crop has at least one variety' : `${cropsWithoutVarieties.length} crops have no varieties`,
        cta: 'Open varieties', href: '/expert/varieties',
      },
      {
        ok: cropsWithoutSymptoms.length === 0,
        title: cropsWithoutSymptoms.length === 0 ? 'Every crop has documented symptoms' : `${cropsWithoutSymptoms.length} crops have no symptoms`,
        cta: 'Open symptoms', href: '/expert/symptoms',
      },
    ];
  }, [crops, varieties, symptoms]);

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-lg bg-role-expert-soft text-role-expert flex items-center justify-center">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-1">Curate the agricultural data that powers every diagnosis and prescription.</p>
        </div>
      </header>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={`border-l-4 ${s.border} cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => navigate(RESOURCE_LINKS.find((l) => l.label === s.label)?.path || '/expert/dashboard')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black">{s.value.toLocaleString()}</p>
                <s.icon className={`h-4 w-4 ${s.tone}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-role-expert" /> Manage data
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {RESOURCE_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-role-expert/40 hover:bg-muted/40 transition-all text-left group"
              >
                <link.icon className={`h-5 w-5 ${link.tone}`} />
                <span className="font-medium flex-1 text-sm">{link.label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Knowledge base health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {health.map((h, i) => (
              <button
                key={i}
                onClick={() => navigate(h.href)}
                className="w-full flex items-start gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left"
              >
                {h.ok
                  ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                  : <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{h.title}</p>
                  {!h.ok && <p className="text-xs text-muted-foreground mt-0.5">{h.cta} →</p>}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Quick actions</CardTitle>
          <Badge variant="secondary" className="text-[10px]">Shortcuts</Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/crops')}>+ Crop</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/varieties')}>+ Variety</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/symptoms')}>+ Symptom</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/diagnoses')}>+ Diagnosis</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/products')}>+ Product</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/mappings')}>+ Mapping</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/expert/prescriptions')}>+ Prescription</Button>
        </CardContent>
      </Card>

      <RecentActivity
        crops={crops as any[]}
        varieties={varieties as any[]}
        symptoms={symptoms as any[]}
        diagnoses={diagnoses as any[]}
        products={products as any[]}
      />
    </div>
  );
}

function RecentActivity({ crops, varieties, symptoms, diagnoses, products }: {
  crops: any[]; varieties: any[]; symptoms: any[]; diagnoses: any[]; products: any[];
}) {
  const navigate = useNavigate();
  const items: ActivityItem[] = useMemo(() => [
    ...crops.map((c) => ({ label: 'Crop', name: c.name, date: c.created_at, href: '/expert/crops' })),
    ...varieties.map((v) => ({ label: 'Variety', name: v.variety_name, date: v.created_at, href: '/expert/varieties' })),
    ...symptoms.map((s) => ({ label: 'Symptom', name: s.symptom_name, date: s.created_at, href: '/expert/symptoms' })),
    ...diagnoses.map((d) => ({ label: 'Diagnosis', name: d.diagnosis_name, date: d.created_at, href: '/expert/diagnoses' })),
    ...products.map((p) => ({ label: 'Product', name: p.product_name, date: p.created_at, href: '/expert/products' })),
  ]
    .filter((i) => i.date && i.name)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10), [crops, varieties, symptoms, diagnoses, products]);

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
              <li key={idx}>
                <button
                  onClick={() => navigate(it.href)}
                  className="w-full flex items-center justify-between py-2.5 text-sm hover:bg-muted/30 rounded-md px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-role-expert/10 text-role-expert">
                      {it.label}
                    </span>
                    <span className="truncate font-medium">{it.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-3">{timeAgo(it.date)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

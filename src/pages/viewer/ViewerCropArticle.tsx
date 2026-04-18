import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sprout, Bug } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ViewerCropArticle() {
  const { id } = useParams();
  const cropId = Number(id);
  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops().catch(() => []) });
  const { data: symptoms = [] } = useQuery({ queryKey: ['symptoms'], queryFn: () => apiService.getSymptoms().catch(() => []) });
  const { data: varieties = [] } = useQuery({ queryKey: ['varieties'], queryFn: () => apiService.getAll('varieties').catch(() => []) });
  const { data: mappings = [] } = useQuery({
    queryKey: ['mappings'],
    queryFn: async () => { try { const r = await apiService.get('/mappings'); return r.data?.data || []; } catch { return []; } },
  });
  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } },
  });

  const crop = crops.find((c: any) => c.id === cropId);
  const cropSymptoms = symptoms.filter((s: any) => s.crop_id === cropId);
  const cropVarieties = varieties.filter((v: any) => v.crop_id === cropId);

  // Cross-link: diseases affecting this crop, derived from mappings (symptom→diagnosis) joined to symptoms of this crop.
  const symptomIds = new Set(cropSymptoms.map((s: any) => s.id));
  const relatedDiagnosisIds = new Set(
    mappings.filter((m: any) => symptomIds.has(m.symptom_id)).map((m: any) => m.diagnosis_id)
  );
  const relatedDiseases = diagnoses.filter((d: any) => relatedDiagnosisIds.has(d.id));

  if (!crop) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-muted-foreground">Crop not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/viewer/crops"><ArrowLeft className="h-4 w-4 mr-2" />Back to crops</Link></Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <Breadcrumbs
        accentClass="text-role-viewer"
        items={[
          { label: 'Browse', to: '/viewer/browse' },
          { label: 'Crops', to: '/viewer/crops' },
          { label: crop.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <article className="space-y-6 min-w-0">
          <Button asChild variant="ghost" size="sm" className="w-fit"><Link to="/viewer/crops"><ArrowLeft className="h-4 w-4 mr-1" />All crops</Link></Button>
          <header className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-role-agent-soft flex items-center justify-center">
                <Sprout className="h-7 w-7 text-role-agent" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{crop.name}</h1>
                {crop.local_name && <p className="text-muted-foreground">{crop.local_name}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {crop.category && <Badge variant="outline">{crop.category}</Badge>}
              {crop.growing_season && <Badge variant="secondary">{crop.growing_season}</Badge>}
              {crop.scientific_name && <Badge variant="outline" className="italic">{crop.scientific_name}</Badge>}
            </div>
          </header>

          {crop.description && (
            <section>
              <h2 className="text-lg font-semibold mb-2">📋 Overview</h2>
              <p className="text-sm leading-relaxed text-foreground/90">{crop.description}</p>
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-2">🌾 Varieties</h2>
            {cropVarieties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No varieties listed for this crop.</p>
            ) : (
              <ul className="space-y-1">
                {cropVarieties.map((v: any) => (
                  <li key={v.id} className="text-sm">
                    <span className="font-medium">{v.variety_name}</span>
                    {v.variety_name_local && <span className="text-muted-foreground"> — {v.variety_name_local}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">🦠 Common Symptoms</h2>
            {cropSymptoms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No symptoms recorded for this crop.</p>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-2">
                  {cropSymptoms.slice(0, 8).map((s: any) => (
                    <div key={s.id} className="text-sm flex items-start gap-2">
                      <span className="text-role-viewer">•</span>
                      <span><span className="font-medium">{s.symptom_name}</span>{s.symptom_name_local && ` (${s.symptom_name_local})`}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </section>
        </article>

        {/* Sidebar: related diseases */}
        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Bug className="h-4 w-4 text-destructive" />
                Diseases affecting {crop.name}
              </h3>
              {relatedDiseases.length === 0 ? (
                <p className="text-xs text-muted-foreground">No related diseases found.</p>
              ) : (
                <ul className="space-y-2">
                  {relatedDiseases.slice(0, 8).map((d: any) => (
                    <li key={d.id} className="text-sm">
                      <Link to={`/viewer/diseases/${d.id}`} className="text-role-viewer hover:underline">
                        → {d.diagnosis_name}
                      </Link>
                      {d.severity && <span className="ml-2 text-[10px] uppercase text-muted-foreground">{d.severity}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-xs text-muted-foreground">
              Tip: press <kbd className="rounded border bg-muted px-1 font-mono">⌘K</kbd> to jump to any crop, disease or product.
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

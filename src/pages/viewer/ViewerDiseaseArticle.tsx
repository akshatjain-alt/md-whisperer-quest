import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bug } from 'lucide-react';

export default function ViewerDiseaseArticle() {
  const { id } = useParams();
  const did = Number(id);
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } } });
  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions'], queryFn: async () => { try { const r = await apiService.get('/prescriptions'); return r.data?.data || []; } catch { return []; } } });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => { try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; } } });

  const diagnosis = diagnoses.find((d: any) => d.id === did);
  const treatments = prescriptions.filter((p: any) => p.diagnosis_id === did);

  if (!diagnosis) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-muted-foreground">Disease not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/viewer/diseases"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
      </div>
    );
  }

  return (
    <article className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/viewer/diseases"><ArrowLeft className="h-4 w-4 mr-1" />All diseases</Link></Button>
      <header className="border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Bug className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{diagnosis.diagnosis_name}</h1>
            {diagnosis.diagnosis_name_local && <p className="text-muted-foreground">{diagnosis.diagnosis_name_local}</p>}
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {diagnosis.disease_type && <Badge variant="outline">{diagnosis.disease_type}</Badge>}
          {diagnosis.severity && <Badge variant="secondary">{diagnosis.severity}</Badge>}
          {diagnosis.spread_rate && <Badge variant="outline">Spread: {diagnosis.spread_rate}</Badge>}
        </div>
      </header>

      {diagnosis.description && (
        <section><h2 className="text-lg font-semibold mb-2">🔬 Description</h2><p className="text-sm leading-relaxed">{diagnosis.description}</p></section>
      )}
      {diagnosis.causative_agent && (
        <section><h2 className="text-lg font-semibold mb-2">🧬 Causative agent</h2><p className="text-sm italic">{diagnosis.causative_agent}</p></section>
      )}
      {diagnosis.favorable_conditions && (
        <section><h2 className="text-lg font-semibold mb-2">🌡️ Favorable conditions</h2><p className="text-sm">{diagnosis.favorable_conditions}</p></section>
      )}
      {diagnosis.prevention_tips && (
        <section><h2 className="text-lg font-semibold mb-2">🛡️ Prevention</h2><p className="text-sm">{diagnosis.prevention_tips}</p></section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">💊 Treatment</h2>
        {treatments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No treatments recorded.</p>
        ) : (
          <Card><CardContent className="p-4 space-y-3">
            {treatments.map((t: any) => {
              const prod = products.find((p: any) => p.id === t.product_id);
              return (
                <div key={t.id} className="text-sm">
                  <Link to={`/viewer/products/${t.product_id}`} className="font-medium text-role-viewer hover:underline">
                    {prod?.product_name || `Product #${t.product_id}`}
                  </Link>
                  {t.dosage_per_acre && <p className="text-xs text-muted-foreground">Dosage: {t.dosage_per_acre} per acre</p>}
                  {t.application_method && <p className="text-xs text-muted-foreground">Method: {t.application_method}</p>}
                </div>
              );
            })}
          </CardContent></Card>
        )}
      </section>
    </article>
  );
}

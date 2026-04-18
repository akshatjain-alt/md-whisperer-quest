import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import apiService from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pill, Bug } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ViewerProductArticle() {
  const { id } = useParams();
  const pid = Number(id);
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: async () => { try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; } } });
  const { data: prescriptions = [] } = useQuery({ queryKey: ['prescriptions'], queryFn: async () => { try { const r = await apiService.get('/prescriptions'); return r.data?.data || []; } catch { return []; } } });
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: async () => { try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; } } });

  const product = products.find((p: any) => p.id === pid);
  const treats = prescriptions.filter((pr: any) => pr.product_id === pid);

  // Distinct related diseases for sidebar
  const relatedDiseases = Array.from(new Map(
    treats.map((t: any) => {
      const d = diagnoses.find((x: any) => x.id === t.diagnosis_id);
      return [t.diagnosis_id, d];
    })
  ).values()).filter(Boolean);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-muted-foreground">Product not found.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/viewer/products"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <Breadcrumbs
        accentClass="text-role-viewer"
        items={[
          { label: 'Browse', to: '/viewer/browse' },
          { label: 'Products', to: '/viewer/products' },
          { label: product.product_name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <article className="space-y-6 min-w-0">
          <Button asChild variant="ghost" size="sm" className="w-fit"><Link to="/viewer/products"><ArrowLeft className="h-4 w-4 mr-1" />All products</Link></Button>
          <header className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-role-admin-soft flex items-center justify-center">
                <Pill className="h-7 w-7 text-role-admin" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{product.product_name}</h1>
                {product.manufacturer && <p className="text-muted-foreground">by {product.manufacturer}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.product_category && <Badge variant="outline">{product.product_category}</Badge>}
              {product.formulation && <Badge variant="secondary">{product.formulation}</Badge>}
              {product.active_ingredient && <Badge variant="outline">{product.active_ingredient}</Badge>}
            </div>
          </header>

          {product.description && (
            <section><h2 className="text-lg font-semibold mb-2">💊 Description</h2><p className="text-sm leading-relaxed">{product.description}</p></section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-2">🦠 Treats these diseases</h2>
            {treats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No diseases linked to this product.</p>
            ) : (
              <Card><CardContent className="p-4 space-y-2">
                {treats.map((t: any) => {
                  const d = diagnoses.find((x: any) => x.id === t.diagnosis_id);
                  return (
                    <Link key={t.id} to={`/viewer/diseases/${t.diagnosis_id}`} className="block text-sm text-role-viewer hover:underline">
                      → {d?.diagnosis_name || `Diagnosis #${t.diagnosis_id}`}
                    </Link>
                  );
                })}
              </CardContent></Card>
            )}
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-4 self-start">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Bug className="h-4 w-4 text-destructive" />
                Related diseases
              </h3>
              {relatedDiseases.length === 0 ? (
                <p className="text-xs text-muted-foreground">No related diseases.</p>
              ) : (
                <ul className="space-y-2">
                  {relatedDiseases.slice(0, 8).map((d: any) => (
                    <li key={d.id} className="text-sm">
                      <Link to={`/viewer/diseases/${d.id}`} className="text-role-viewer hover:underline">
                        → {d.diagnosis_name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-xs text-muted-foreground">
              Always follow the dosage on the label. Press <kbd className="rounded border bg-muted px-1 font-mono">⌘K</kbd> to search.
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

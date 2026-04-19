import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';

/**
 * Print-friendly prescription view.
 * Renders a clean A4 layout with hidden chrome via @media print rules
 * (declared inline in this file's <style> tag to avoid touching globals).
 */
export default function PrescriptionPrint() {
  const { id } = useParams();
  const pid = Number(id);
  const navigate = useNavigate();

  const { data: prescription, isLoading } = useQuery({
    queryKey: ['prescription', pid],
    queryFn: async () => {
      try {
        const r = await apiService.get(`/prescriptions/${pid}`);
        return r.data?.data || r.data;
      } catch {
        return null;
      }
    },
    enabled: !!pid,
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: async () => {
      try { const r = await apiService.get('/diagnoses'); return r.data?.data || []; } catch { return []; }
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try { const r = await apiService.get('/products'); return r.data?.data || []; } catch { return []; }
    },
  });

  // Auto-focus the print button
  useEffect(() => {
    document.title = `Prescription #${pid}`;
  }, [pid]);

  const diagnosis = diagnoses.find((d: any) => d.id === prescription?.diagnosis_id);
  const product = products.find((p: any) => p.id === prescription?.product_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 print:bg-background">
      {/* Print rules: hide everything outside the print sheet */}
      <style>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-sheet { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Toolbar (hidden in print) */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-sm text-muted-foreground">Prescription #{pid}</div>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      {/* Print sheet */}
      <div className="max-w-3xl mx-auto p-6">
        <div className="print-sheet bg-card border border-border rounded-lg shadow-sm p-10">
          {/* Letterhead */}
          <header className="flex items-start justify-between border-b-2 border-foreground/80 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight">🌾 Smart Kisan Bharat</h1>
              <p className="text-xs text-muted-foreground mt-1">Agricultural Prescription &amp; Advisory</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Prescription</p>
              <p className="text-xl font-bold">#{pid}</p>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
          </header>

          {/* Diagnosis */}
          <section className="mb-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Diagnosis
            </h2>
            <p className="text-lg font-semibold">
              {diagnosis?.diagnosis_name || `Diagnosis #${prescription?.diagnosis_id ?? '—'}`}
            </p>
            {diagnosis?.disease_type && (
              <p className="text-sm text-muted-foreground">{diagnosis.disease_type}</p>
            )}
          </section>

          {/* Recommended product */}
          <section className="mb-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Recommended Product
            </h2>
            <div className="border border-border rounded-md p-4">
              <p className="text-lg font-semibold">
                {product?.product_name || `Product #${prescription?.product_id ?? '—'}`}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                {product?.manufacturer && (
                  <p><span className="text-muted-foreground">Manufacturer:</span> {product.manufacturer}</p>
                )}
                {product?.active_ingredient && (
                  <p><span className="text-muted-foreground">Active ingredient:</span> {product.active_ingredient}</p>
                )}
                {product?.formulation && (
                  <p><span className="text-muted-foreground">Formulation:</span> {product.formulation}</p>
                )}
                {product?.pack_sizes && (
                  <p><span className="text-muted-foreground">Pack sizes:</span> {product.pack_sizes}</p>
                )}
              </div>
            </div>
          </section>

          {/* Dosage */}
          <section className="mb-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Dosage &amp; Application
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {prescription?.dosage_per_litre && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Per litre</p>
                  <p className="font-semibold">{prescription.dosage_per_litre}</p>
                </div>
              )}
              {prescription?.dosage_per_acre && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Per acre</p>
                  <p className="font-semibold">{prescription.dosage_per_acre}</p>
                </div>
              )}
              {prescription?.dosage_per_bigha && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Per bigha</p>
                  <p className="font-semibold">{prescription.dosage_per_bigha}</p>
                </div>
              )}
              {prescription?.application_method && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Method</p>
                  <p className="font-semibold">{prescription.application_method}</p>
                </div>
              )}
              {prescription?.application_timing && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Timing</p>
                  <p className="font-semibold">{prescription.application_timing}</p>
                </div>
              )}
              {prescription?.frequency && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Frequency</p>
                  <p className="font-semibold">{prescription.frequency}</p>
                </div>
              )}
              {prescription?.num_applications != null && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">No. of applications</p>
                  <p className="font-semibold">{prescription.num_applications}</p>
                </div>
              )}
              {prescription?.waiting_period_days != null && (
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground">Waiting period</p>
                  <p className="font-semibold">{prescription.waiting_period_days} days</p>
                </div>
              )}
            </div>
          </section>

          {/* Instructions */}
          {prescription?.instructions && (
            <section className="mb-6">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Instructions
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">{prescription.instructions}</p>
            </section>
          )}

          {/* Precautions */}
          {prescription?.precautions && (
            <section className="mb-6">
              <h2 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">
                ⚠ Precautions
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">{prescription.precautions}</p>
            </section>
          )}

          {/* Footer / signature */}
          <footer className="mt-10 pt-6 border-t border-border grid grid-cols-2 gap-8">
            <div>
              <div className="h-12 border-b border-foreground/40" />
              <p className="text-xs text-muted-foreground mt-1">Farmer signature</p>
            </div>
            <div>
              <div className="h-12 border-b border-foreground/40" />
              <p className="text-xs text-muted-foreground mt-1">Agent signature &amp; stamp</p>
            </div>
          </footer>

          <p className="text-[10px] text-muted-foreground text-center mt-6">
            Always read the product label before use. Keep out of reach of children.
          </p>
        </div>

        <div className="no-print text-center mt-4">
          <Link to="/agent/history" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to history
          </Link>
        </div>
      </div>
    </div>
  );
}

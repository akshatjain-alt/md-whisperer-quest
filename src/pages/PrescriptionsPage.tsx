import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Prescription } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  diagnosis_id: z.string().min(1, 'Select a diagnosis'),
  product_id: z.string().min(1, 'Select a product'),
  dosage_per_litre: z.string().optional(),
  dosage_per_acre: z.string().optional(),
  dosage_per_bigha: z.string().optional(),
  application_method: z.enum(['Spray', 'Drench', 'Broadcast', 'Seed Treatment']),
  application_timing: z.string().optional(),
  frequency: z.enum(['Once', 'Weekly', 'Fortnightly', 'Monthly']),
  num_applications: z.coerce.number().optional().default(1),
  precautions: z.string().optional(),
  compatibility_notes: z.string().optional(),
  waiting_period_days: z.coerce.number().optional().default(0),
  instructions: z.string().optional(),
  priority: z.coerce.number().min(1).default(1),
});
type FormData = z.infer<typeof schema>;

export default function PrescriptionsPage() {
  const { prescriptions, addPrescription, updatePrescription, deletePrescription, diagnoses, products } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const getDiagnosisName = (id: string) => diagnoses.find((d) => d.id === id)?.name || 'Unknown';
  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || 'Unknown';

  const columns: Column<Prescription>[] = [
    { key: 'diagnosis_id', label: 'Diagnosis', render: (p) => <span className="font-medium">{getDiagnosisName(p.diagnosis_id)}</span> },
    { key: 'product_id', label: 'Product', render: (p) => <Badge variant="outline" className="text-xs">{getProductName(p.product_id)}</Badge> },
    { key: 'dosage_per_litre', label: 'Dosage/L' },
    { key: 'application_method', label: 'Method', render: (p) => <Badge variant="secondary" className="text-xs">{p.application_method}</Badge> },
    { key: 'priority', label: 'Priority' },
  ];

  const openNew = () => { setEditing(null); reset({ application_method: 'Spray', frequency: 'Once', priority: 1 }); setShowForm(true); };
  const openEdit = (p: Prescription) => { setEditing(p); reset(p); setShowForm(true); };

  const onSubmit = (data: FormData) => {
    if (editing) { updatePrescription(editing.id, data); toast({ title: 'Updated' }); }
    else { addPrescription(data as Omit<Prescription, 'id' | 'created_at'>); toast({ title: 'Prescription added' }); }
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Prescriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Link diagnoses to products with dosage info</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light"><Plus size={16} className="mr-2" /> Add Prescription</Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_440px]' : ''}`}>
        <DataTable data={prescriptions} columns={columns} searchKeys={[]} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Prescription</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label>Diagnosis *</Label>
                <Select defaultValue={editing?.diagnosis_id} onValueChange={(v) => setValue('diagnosis_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select diagnosis" /></SelectTrigger>
                  <SelectContent>{diagnoses.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.diagnosis_id && <p className="text-xs text-destructive mt-1">{errors.diagnosis_id.message}</p>}
              </div>
              <div><Label>Product *</Label>
                <Select defaultValue={editing?.product_id} onValueChange={(v) => setValue('product_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.product_id && <p className="text-xs text-destructive mt-1">{errors.product_id.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div><Label>Dosage/L</Label><Input {...register('dosage_per_litre')} placeholder="1ml/L" /></div>
                <div><Label>Dosage/Acre</Label><Input {...register('dosage_per_acre')} placeholder="200ml" /></div>
                <div><Label>Dosage/Bigha</Label><Input {...register('dosage_per_bigha')} placeholder="100ml" /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Method</Label>
                  <Select defaultValue={editing?.application_method || 'Spray'} onValueChange={(v) => setValue('application_method', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Spray','Drench','Broadcast','Seed Treatment'].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Frequency</Label>
                  <Select defaultValue={editing?.frequency || 'Once'} onValueChange={(v) => setValue('frequency', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Once','Weekly','Fortnightly','Monthly'].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div><Label>Application Timing</Label><Input {...register('application_timing')} placeholder="Morning/Evening, Crop stage" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label># Applications</Label><Input type="number" {...register('num_applications')} /></div>
                <div><Label>Waiting Period (days)</Label><Input type="number" {...register('waiting_period_days')} /></div>
              </div>
              <div><Label>Priority</Label><Input type="number" {...register('priority')} /></div>
              <div><Label>Precautions</Label><Textarea {...register('precautions')} rows={2} /></div>
              <div><Label>Compatibility Notes</Label><Textarea {...register('compatibility_notes')} rows={2} /></div>
              <div><Label>Instructions</Label><Textarea {...register('instructions')} rows={3} /></div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light">{editing ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Prescription" description="Are you sure?" onConfirm={() => { deletePrescription(deleteId!); setDeleteId(null); toast({ title: 'Deleted' }); }} />
    </div>
  );
}

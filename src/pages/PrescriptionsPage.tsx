import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Diagnosis, Prescription, Product } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import PageHeader from '@/components/expert/PageHeader';
import ResourceFormSheet from '@/components/expert/ResourceFormSheet';
import LoadingState from '@/components/expert/LoadingState';
import EmptyState from '@/components/expert/EmptyState';
import { useResourceMutations } from '@/hooks/useResourceMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  diagnosis_id: z.number({ message: 'Select a diagnosis' }),
  product_id: z.number({ message: 'Select a product' }),
  dosage_per_acre: z.string().optional(),
  dosage_per_bigha: z.string().optional(),
  application_method: z.string().optional(),
  frequency: z.string().optional(),
  precautions: z.string().optional(),
  waiting_period_days: z.number().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PrescriptionsPage() {
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data: prescriptions = [], isLoading } = useQuery<Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: async () => (await apiService.get('/prescriptions')).data?.data || [],
  });
  const { data: diagnoses = [] } = useQuery<Diagnosis[]>({
    queryKey: ['diagnoses'],
    queryFn: async () => (await apiService.get('/diagnoses')).data?.data || [],
  });
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await apiService.get('/products')).data?.data || [],
  });

  const diagnosesById = useMemo(() => new Map(diagnoses.map((d) => [d.id, d.diagnosis_name])), [diagnoses]);
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p.product_name])), [products]);

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };
  const { createMutation, updateMutation, deleteMutation, isSubmitting } = useResourceMutations<Prescription, FormData>({
    queryKey: ['prescriptions'],
    label: 'Prescription',
    create: async (data) => (await apiService.post('/prescriptions', data)).data,
    update: async ({ id, data }) => (await apiService.put(`/prescriptions/${id}`, data)).data,
    remove: (id) => apiService.delete('prescriptions', id),
    onCreated: closeForm,
    onUpdated: closeForm,
    onRemoved: () => setDeleteId(null),
  });

  const columns: Column<Prescription>[] = useMemo(() => [
    { key: 'diagnosis_id', label: 'Diagnosis', render: (p) => <span className="font-medium">{diagnosesById.get(p.diagnosis_id) || `#${p.diagnosis_id}`}</span>, csvAccessor: (p) => diagnosesById.get(p.diagnosis_id) || `#${p.diagnosis_id}` },
    { key: 'product_id', label: 'Product', render: (p) => <Badge variant="outline" className="text-xs">{productsById.get(p.product_id) || `#${p.product_id}`}</Badge>, csvAccessor: (p) => productsById.get(p.product_id) || `#${p.product_id}` },
    { key: 'dosage_per_acre', label: 'Dosage / acre', render: (p) => p.dosage_per_acre || '—' },
    { key: 'application_method', label: 'Method', render: (p) => p.application_method || '—' },
    { key: 'frequency', label: 'Frequency', render: (p) => p.frequency || '—' },
    { key: 'waiting_period_days', label: 'PHI', render: (p) => p.waiting_period_days ? `${p.waiting_period_days}d` : '—' },
  ], [diagnosesById, productsById]);

  const openNew = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (p: Prescription) => {
    setEditing(p);
    reset({
      diagnosis_id: p.diagnosis_id,
      product_id: p.product_id,
      dosage_per_acre: p.dosage_per_acre || '',
      dosage_per_bigha: p.dosage_per_bigha || '',
      application_method: p.application_method || '',
      frequency: p.frequency || '',
      precautions: p.precautions || '',
      waiting_period_days: p.waiting_period_days || undefined,
    });
    setShowForm(true);
  };
  const onSubmit = handleSubmit((data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  });

  const blocker = diagnoses.length === 0 || products.length === 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={ClipboardList}
        title="Prescriptions"
        description="Treatment recipes that pair a diagnosis with a recommended product and dosage."
        count={prescriptions.length}
        countLabel="prescriptions"
        actions={
          <Button onClick={openNew} disabled={blocker}>
            <Plus size={16} className="mr-1.5" /> Add prescription
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading prescriptions…" />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={blocker ? 'Add diagnoses and products first' : 'No prescriptions yet'}
          description={blocker
            ? 'Prescriptions require at least one diagnosis and one product to link together.'
            : 'Tie a diagnosis to a product so agents have a concrete treatment recommendation.'}
          actionLabel={blocker ? undefined : 'Add prescription'}
          onAction={blocker ? undefined : openNew}
        />
      ) : (
        <DataTable
          data={prescriptions}
          columns={columns as any}
          searchKeys={['application_method', 'frequency']}
          onEdit={openEdit as any}
          onDelete={(id) => setDeleteId(Number(id))}
          exportFilename="prescriptions"
        />
      )}

      <ResourceFormSheet
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : closeForm())}
        title="prescription"
        isEditing={!!editing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div>
          <Label>Diagnosis *</Label>
          <Select value={watch('diagnosis_id') ? String(watch('diagnosis_id')) : ''} onValueChange={(v) => setValue('diagnosis_id', Number(v))} disabled={isSubmitting}>
            <SelectTrigger><SelectValue placeholder="Select diagnosis" /></SelectTrigger>
            <SelectContent>
              {diagnoses.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.diagnosis_name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.diagnosis_id && <p className="text-xs text-destructive mt-1">{errors.diagnosis_id.message}</p>}
        </div>
        <div>
          <Label>Product *</Label>
          <Select value={watch('product_id') ? String(watch('product_id')) : ''} onValueChange={(v) => setValue('product_id', Number(v))} disabled={isSubmitting}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              {products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.product_name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.product_id && <p className="text-xs text-destructive mt-1">{errors.product_id.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dosage_per_acre">Dosage / acre</Label>
            <Input id="dosage_per_acre" {...register('dosage_per_acre')} placeholder="200 ml" disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="dosage_per_bigha">Dosage / bigha</Label>
            <Input id="dosage_per_bigha" {...register('dosage_per_bigha')} placeholder="80 ml" disabled={isSubmitting} />
          </div>
        </div>
        <div>
          <Label htmlFor="application_method">Application method</Label>
          <Input id="application_method" {...register('application_method')} placeholder="Foliar spray" disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Input id="frequency" {...register('frequency')} placeholder="Every 15 days" disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="waiting_period_days">Pre-harvest interval (days)</Label>
          <Input id="waiting_period_days" type="number" {...register('waiting_period_days', { valueAsNumber: true })} disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="precautions">Precautions</Label>
          <Textarea id="precautions" {...register('precautions')} rows={3} disabled={isSubmitting} />
        </div>
      </ResourceFormSheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete prescription"
        description="Agents will no longer see this treatment for the linked diagnosis."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

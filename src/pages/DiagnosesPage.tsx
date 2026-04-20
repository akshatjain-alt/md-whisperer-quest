import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Diagnosis } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import SeverityBadge from '@/components/SeverityBadge';
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

const TYPES = ['Fungal', 'Bacterial', 'Viral', 'Pest', 'Deficiency', 'Other'] as const;
const SEVERITY = ['Mild', 'Moderate', 'Severe'] as const;
const SPREAD = ['Slow', 'Medium', 'Fast'] as const;

const schema = z.object({
  diagnosis_name: z.string().min(2, 'Name must be at least 2 characters'),
  diagnosis_name_local: z.string().optional(),
  disease_type: z.enum(TYPES),
  causative_agent: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(SEVERITY),
  spread_rate: z.enum(SPREAD),
  favorable_conditions: z.string().optional(),
  prevention_tips: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Diagnosis>[] = [
  { key: 'diagnosis_name', label: 'Diagnosis', render: (d) => <span className="font-medium">{d.diagnosis_name}</span> },
  { key: 'diagnosis_name_local', label: 'Local Name', render: (d) => d.diagnosis_name_local || <span className="text-muted-foreground">—</span> },
  { key: 'disease_type', label: 'Type', render: (d) => d.disease_type ? <Badge variant="outline" className="text-xs">{d.disease_type}</Badge> : '—' },
  { key: 'causative_agent', label: 'Agent', render: (d) => d.causative_agent ? <span className="italic text-xs text-muted-foreground">{d.causative_agent}</span> : '—' },
  { key: 'severity', label: 'Severity', render: (d) => d.severity ? <SeverityBadge level={d.severity} /> : '—' },
  { key: 'spread_rate', label: 'Spread', render: (d) => d.spread_rate ? <SeverityBadge level={d.spread_rate} /> : '—' },
];

export default function DiagnosesPage() {
  const [editing, setEditing] = useState<Diagnosis | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { disease_type: 'Fungal', severity: 'Moderate', spread_rate: 'Medium' },
  });

  const { data: diagnoses = [], isLoading } = useQuery<Diagnosis[]>({
    queryKey: ['diagnoses'],
    queryFn: async () => {
      const r = await apiService.get('/diagnoses');
      return r.data?.data || [];
    },
  });

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };
  const { createMutation, updateMutation, deleteMutation, isSubmitting } = useResourceMutations<Diagnosis, FormData>({
    queryKey: ['diagnoses'],
    label: 'Diagnosis',
    create: async (data) => (await apiService.post('/diagnoses', data)).data,
    update: async ({ id, data }) => (await apiService.put(`/diagnoses/${id}`, data)).data,
    remove: (id) => apiService.delete('diagnoses', id),
    onCreated: closeForm,
    onUpdated: closeForm,
    onRemoved: () => setDeleteId(null),
  });

  const openNew = () => {
    setEditing(null);
    reset({ diagnosis_name: '', disease_type: 'Fungal', severity: 'Moderate', spread_rate: 'Medium' });
    setShowForm(true);
  };
  const openEdit = (d: Diagnosis) => {
    setEditing(d);
    reset({
      diagnosis_name: d.diagnosis_name,
      diagnosis_name_local: d.diagnosis_name_local || '',
      disease_type: (d.disease_type as any) || 'Fungal',
      causative_agent: d.causative_agent || '',
      description: d.description || '',
      severity: (d.severity as any) || 'Moderate',
      spread_rate: (d.spread_rate as any) || 'Medium',
      favorable_conditions: d.favorable_conditions || '',
      prevention_tips: d.prevention_tips || '',
    });
    setShowForm(true);
  };
  const onSubmit = handleSubmit((data) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Stethoscope}
        title="Diagnoses"
        description="Diseases, deficiencies and pests that match observed symptoms."
        count={diagnoses.length}
        countLabel="diagnoses"
        actions={
          <Button onClick={openNew}>
            <Plus size={16} className="mr-1.5" /> Add diagnosis
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading diagnoses…" />
      ) : diagnoses.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No diagnoses yet"
          description="Each diagnosis links symptoms to recommended treatments."
          actionLabel="Add diagnosis"
          onAction={openNew}
        />
      ) : (
        <DataTable
          data={diagnoses}
          columns={columns as any}
          searchKeys={['diagnosis_name', 'diagnosis_name_local', 'disease_type', 'causative_agent']}
          onEdit={openEdit as any}
          onDelete={(id) => setDeleteId(Number(id))}
          exportFilename="diagnoses"
        />
      )}

      <ResourceFormSheet
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : closeForm())}
        title="diagnosis"
        isEditing={!!editing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="diagnosis_name">Name *</Label>
          <Input id="diagnosis_name" {...register('diagnosis_name')} placeholder="e.g. Powdery Mildew" disabled={isSubmitting} />
          {errors.diagnosis_name && <p className="text-xs text-destructive mt-1">{errors.diagnosis_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="diagnosis_name_local">Local name</Label>
          <Input id="diagnosis_name_local" {...register('diagnosis_name_local')} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Disease type</Label>
          <Select value={watch('disease_type')} onValueChange={(v) => setValue('disease_type', v as any)} disabled={isSubmitting}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="causative_agent">Causative agent</Label>
          <Input id="causative_agent" {...register('causative_agent')} placeholder="Scientific name" disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Severity</Label>
            <Select value={watch('severity')} onValueChange={(v) => setValue('severity', v as any)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEVERITY.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Spread rate</Label>
            <Select value={watch('spread_rate')} onValueChange={(v) => setValue('spread_rate', v as any)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SPREAD.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="favorable_conditions">Favorable conditions</Label>
          <Textarea id="favorable_conditions" {...register('favorable_conditions')} rows={2} disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="prevention_tips">Prevention tips</Label>
          <Textarea id="prevention_tips" {...register('prevention_tips')} rows={2} disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={3} disabled={isSubmitting} />
        </div>
      </ResourceFormSheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete diagnosis"
        description="Linked symptom-mappings and prescriptions will be detached. This cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

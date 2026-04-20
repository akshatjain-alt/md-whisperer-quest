import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Crop, Symptom } from '@/types';
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

const ALL_CROPS = '__all__';
const NO_CROP = '__none__';

const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'All Stages'] as const;
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
const AFFECTED_PARTS = ['Leaf', 'Stem', 'Root', 'Fruit', 'Flower', 'Whole Plant'] as const;

const schema = z.object({
  symptom_name: z.string().min(2, 'Name must be at least 2 characters'),
  symptom_name_local: z.string().optional(),
  crop_id: z.number().optional(),
  description: z.string().optional(),
  affected_part: z.enum(AFFECTED_PARTS).optional(),
  visual_indicators: z.string().optional(),
  stage_of_crop: z.enum(STAGES).optional(),
  severity_level: z.enum(SEVERITY_LEVELS).optional(),
});
type FormData = z.infer<typeof schema>;

export default function SymptomsPage() {
  const [editing, setEditing] = useState<Symptom | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterCrop, setFilterCrop] = useState<string>(ALL_CROPS);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data: crops = [] } = useQuery<Crop[]>({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops(),
  });
  const cropsById = useMemo(() => new Map(crops.map((c) => [c.id, c.name])), [crops]);

  const { data: symptoms = [], isLoading } = useQuery<Symptom[]>({
    queryKey: ['symptoms', filterCrop],
    queryFn: () => apiService.getSymptoms(filterCrop !== ALL_CROPS ? Number(filterCrop) : undefined),
  });

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };
  const { createMutation, updateMutation, deleteMutation, isSubmitting } = useResourceMutations<Symptom, FormData>({
    queryKey: ['symptoms'],
    label: 'Symptom',
    create: (data) => apiService.createSymptom(data),
    update: ({ id, data }) => apiService.updateSymptom(id, data),
    remove: (id) => apiService.deleteSymptom(id),
    onCreated: closeForm,
    onUpdated: closeForm,
    onRemoved: () => setDeleteId(null),
  });

  const columns: Column<Symptom>[] = useMemo(() => [
    { key: 'symptom_name', label: 'Symptom', render: (s) => <span className="font-medium">{s.symptom_name}</span> },
    { key: 'crop_id', label: 'Crop', render: (s) => s.crop_id ? <Badge variant="outline" className="text-xs">{cropsById.get(s.crop_id) || `#${s.crop_id}`}</Badge> : <span className="text-xs text-muted-foreground">General</span>, csvAccessor: (s) => s.crop_id ? (cropsById.get(s.crop_id) || `#${s.crop_id}`) : 'General' },
    { key: 'affected_part', label: 'Part', render: (s) => s.affected_part ? <Badge variant="secondary" className="text-xs">{s.affected_part}</Badge> : '—' },
    { key: 'stage_of_crop', label: 'Stage', render: (s) => s.stage_of_crop ? <Badge variant="outline" className="text-xs">{s.stage_of_crop}</Badge> : '—' },
    { key: 'severity_level', label: 'Severity', render: (s) => s.severity_level ? <SeverityBadge level={s.severity_level} /> : '—' },
  ], [cropsById]);

  const openNew = () => {
    setEditing(null);
    reset({
      symptom_name: '', symptom_name_local: '',
      stage_of_crop: 'Vegetative', severity_level: 'Medium', affected_part: 'Leaf',
      crop_id: filterCrop !== ALL_CROPS ? Number(filterCrop) : undefined,
    });
    setShowForm(true);
  };
  const openEdit = (s: Symptom) => {
    setEditing(s);
    reset({
      symptom_name: s.symptom_name,
      symptom_name_local: s.symptom_name_local || '',
      crop_id: s.crop_id,
      description: s.description || '',
      affected_part: (s.affected_part as any) || 'Leaf',
      visual_indicators: s.visual_indicators || '',
      stage_of_crop: (s.stage_of_crop as any) || 'Vegetative',
      severity_level: (s.severity_level as any) || 'Medium',
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
        icon={Search}
        title="Symptoms"
        description="Observable signs that drive symptom-to-diagnosis matching."
        count={symptoms.length}
        countLabel="symptoms"
        actions={
          <>
            <Select value={filterCrop} onValueChange={setFilterCrop}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CROPS}>All crops</SelectItem>
                {crops.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={openNew}>
              <Plus size={16} className="mr-1.5" /> Add symptom
            </Button>
          </>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading symptoms…" />
      ) : symptoms.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No symptoms recorded"
          description="Capture visible signs of plant distress so agents can diagnose them in the field."
          actionLabel="Add symptom"
          onAction={openNew}
        />
      ) : (
        <DataTable
          data={symptoms}
          columns={columns as any}
          searchKeys={['symptom_name', 'symptom_name_local', 'affected_part', 'visual_indicators']}
          onEdit={openEdit as any}
          onDelete={(id) => setDeleteId(Number(id))}
          exportFilename="symptoms"
        />
      )}

      <ResourceFormSheet
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : closeForm())}
        title="symptom"
        isEditing={!!editing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="symptom_name">Symptom name *</Label>
          <Input id="symptom_name" {...register('symptom_name')} placeholder="e.g. Yellow leaf spots" disabled={isSubmitting} />
          {errors.symptom_name && <p className="text-xs text-destructive mt-1">{errors.symptom_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="symptom_name_local">Local name</Label>
          <Input id="symptom_name_local" {...register('symptom_name_local')} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Related crop</Label>
          <Select
            value={watch('crop_id') ? String(watch('crop_id')) : NO_CROP}
            onValueChange={(v) => setValue('crop_id', v === NO_CROP ? undefined : Number(v))}
            disabled={isSubmitting}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CROP}>None (general)</SelectItem>
              {crops.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Affected part</Label>
            <Select value={watch('affected_part') || 'Leaf'} onValueChange={(v) => setValue('affected_part', v as any)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AFFECTED_PARTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Crop stage</Label>
            <Select value={watch('stage_of_crop') || 'Vegetative'} onValueChange={(v) => setValue('stage_of_crop', v as any)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Severity level</Label>
          <Select value={watch('severity_level') || 'Medium'} onValueChange={(v) => setValue('severity_level', v as any)} disabled={isSubmitting}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEVERITY_LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="visual_indicators">Visual indicators</Label>
          <Input id="visual_indicators" {...register('visual_indicators')} placeholder="What does it look like?" disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={4} disabled={isSubmitting} />
        </div>
      </ResourceFormSheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete symptom"
        description="Mappings to diagnoses will also be removed. This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

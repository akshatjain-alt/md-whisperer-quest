import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Dna } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Crop, CropVariety } from '@/types';
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

const ALL_CROPS = '__all__';

const schema = z.object({
  crop_id: z.number({ message: 'Please select a crop' }).min(1, 'Please select a crop'),
  variety_name: z.string().min(2, 'Variety name must be at least 2 characters'),
  variety_name_local: z.string().optional(),
  maturity_days: z.number().optional(),
  yield_per_acre: z.string().optional(),
  characteristics: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function VarietiesPage() {
  const [editing, setEditing] = useState<CropVariety | null>(null);
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

  const { data: varieties = [], isLoading } = useQuery<CropVariety[]>({
    queryKey: ['varieties'],
    queryFn: () => apiService.getAll('varieties'),
  });

  const filtered = useMemo(() => {
    if (filterCrop === ALL_CROPS) return varieties;
    const id = Number(filterCrop);
    return varieties.filter((v) => v.crop_id === id);
  }, [varieties, filterCrop]);

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };
  const { createMutation, updateMutation, deleteMutation, isSubmitting } = useResourceMutations<CropVariety, FormData>({
    queryKey: ['varieties'],
    label: 'Variety',
    create: (data) => apiService.create('varieties', data),
    update: ({ id, data }) => apiService.update('varieties', id, data),
    remove: (id) => apiService.delete('varieties', id),
    onCreated: closeForm,
    onUpdated: closeForm,
    onRemoved: () => setDeleteId(null),
  });

  const columns: Column<CropVariety>[] = useMemo(() => [
    { key: 'variety_name', label: 'Variety', render: (v) => <span className="font-medium">{v.variety_name}</span> },
    { key: 'crop_id', label: 'Crop', render: (v) => <Badge variant="outline" className="text-xs">{cropsById.get(v.crop_id) || `#${v.crop_id}`}</Badge>, csvAccessor: (v) => cropsById.get(v.crop_id) || `#${v.crop_id}` },
    { key: 'variety_name_local', label: 'Local Name', render: (v) => v.variety_name_local || <span className="text-muted-foreground">—</span> },
    { key: 'maturity_days', label: 'Maturity', render: (v) => v.maturity_days ? `${v.maturity_days} days` : '—' },
    { key: 'yield_per_acre', label: 'Yield/Acre', render: (v) => v.yield_per_acre || '—' },
  ], [cropsById]);

  const openNew = () => {
    setEditing(null);
    reset({
      crop_id: filterCrop !== ALL_CROPS ? Number(filterCrop) : undefined,
      variety_name: '', variety_name_local: '', maturity_days: undefined,
      yield_per_acre: '', characteristics: '', description: '',
    });
    setShowForm(true);
  };
  const openEdit = (v: CropVariety) => {
    setEditing(v);
    reset({
      crop_id: v.crop_id,
      variety_name: v.variety_name,
      variety_name_local: v.variety_name_local || '',
      maturity_days: v.maturity_days,
      yield_per_acre: v.yield_per_acre || '',
      characteristics: v.characteristics || '',
      description: v.description || '',
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
        icon={Dna}
        title="Crop varieties"
        description="Catalog cultivars, maturity windows and expected yields."
        count={filtered.length}
        countLabel={filterCrop === ALL_CROPS ? 'varieties' : 'in selected crop'}
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
            <Button onClick={openNew} disabled={crops.length === 0}>
              <Plus size={16} className="mr-1.5" /> Add variety
            </Button>
          </>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading varieties…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Dna}
          title={crops.length === 0 ? 'Add a crop first' : 'No varieties to show'}
          description={crops.length === 0
            ? 'Varieties are tied to crops. Create at least one crop before adding varieties.'
            : 'Try changing the crop filter or add a new variety to this crop.'}
          actionLabel={crops.length > 0 ? 'Add variety' : undefined}
          onAction={crops.length > 0 ? openNew : undefined}
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns as any}
          searchKeys={['variety_name', 'variety_name_local', 'characteristics']}
          onEdit={openEdit as any}
          onDelete={(id) => setDeleteId(Number(id))}
          exportFilename="varieties"
        />
      )}

      <ResourceFormSheet
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : closeForm())}
        title="variety"
        isEditing={!!editing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div>
          <Label>Related crop *</Label>
          <Select value={watch('crop_id') ? String(watch('crop_id')) : ''} onValueChange={(v) => setValue('crop_id', Number(v))} disabled={isSubmitting}>
            <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
            <SelectContent>
              {crops.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.crop_id && <p className="text-xs text-destructive mt-1">{errors.crop_id.message}</p>}
        </div>
        <div>
          <Label htmlFor="variety_name">Variety name *</Label>
          <Input id="variety_name" {...register('variety_name')} placeholder="e.g. HD-2967" disabled={isSubmitting} />
          {errors.variety_name && <p className="text-xs text-destructive mt-1">{errors.variety_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="variety_name_local">Local name</Label>
          <Input id="variety_name_local" {...register('variety_name_local')} disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="maturity_days">Maturity (days)</Label>
            <Input id="maturity_days" type="number" {...register('maturity_days', { valueAsNumber: true })} placeholder="120" disabled={isSubmitting} />
          </div>
          <div>
            <Label htmlFor="yield_per_acre">Yield/acre</Label>
            <Input id="yield_per_acre" {...register('yield_per_acre')} placeholder="30-35 q" disabled={isSubmitting} />
          </div>
        </div>
        <div>
          <Label htmlFor="characteristics">Key characteristics</Label>
          <Input id="characteristics" {...register('characteristics')} placeholder="Drought tolerant, high gluten…" disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={4} disabled={isSubmitting} />
        </div>
      </ResourceFormSheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete variety"
        description="This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

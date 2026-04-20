import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Sprout } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Crop } from '@/types';
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

const CATEGORIES = ['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Fiber', 'Oilseed', 'Cash Crop'] as const;
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'All Year'] as const;

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  local_name: z.string().optional(),
  scientific_name: z.string().optional(),
  category: z.enum(CATEGORIES),
  growing_season: z.enum(SEASONS),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const columns: Column<Crop>[] = [
  { key: 'name', label: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
  { key: 'local_name', label: 'Local Name', render: (c) => c.local_name || <span className="text-muted-foreground">—</span> },
  { key: 'scientific_name', label: 'Scientific', csvSkip: false, render: (c) => c.scientific_name ? <span className="italic text-xs text-muted-foreground">{c.scientific_name}</span> : '—' },
  { key: 'category', label: 'Category', render: (c) => c.category ? <Badge variant="outline" className="text-xs">{c.category}</Badge> : '—' },
  { key: 'growing_season', label: 'Season', render: (c) => c.growing_season ? <Badge variant="secondary" className="text-xs">{c.growing_season}</Badge> : '—' },
];

export default function CropsPage() {
  const [editing, setEditing] = useState<Crop | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Cereal', growing_season: 'Kharif' },
  });

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops(),
  });

  const closeForm = () => { setShowForm(false); setEditing(null); reset(); };
  const { createMutation, updateMutation, deleteMutation, isSubmitting } = useResourceMutations<Crop, FormData>({
    queryKey: ['crops'],
    label: 'Crop',
    create: (data) => apiService.createCrop(data),
    update: ({ id, data }) => apiService.updateCrop(id, data),
    remove: (id) => apiService.deleteCrop(id),
    onCreated: closeForm,
    onUpdated: closeForm,
    onRemoved: () => setDeleteId(null),
  });

  const openNew = () => {
    setEditing(null);
    reset({ name: '', local_name: '', scientific_name: '', category: 'Cereal', growing_season: 'Kharif', description: '' });
    setShowForm(true);
  };
  const openEdit = (crop: Crop) => {
    setEditing(crop);
    reset({
      name: crop.name,
      local_name: crop.local_name || '',
      scientific_name: crop.scientific_name || '',
      category: (crop.category as any) || 'Cereal',
      growing_season: (crop.growing_season as any) || 'Kharif',
      description: crop.description || '',
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
        icon={Sprout}
        title="Crops"
        description="Master list of crops powering varieties, symptoms and diagnoses."
        count={crops.length}
        countLabel="crops"
        actions={
          <Button onClick={openNew}>
            <Plus size={16} className="mr-1.5" /> Add crop
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState label="Loading crops…" />
      ) : crops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No crops yet"
          description="Start your knowledge base by adding the crops your team works with."
          actionLabel="Add your first crop"
          onAction={openNew}
        />
      ) : (
        <DataTable
          data={crops}
          columns={columns as any}
          searchKeys={['name', 'local_name', 'scientific_name', 'category']}
          onEdit={openEdit as any}
          onDelete={(id) => setDeleteId(Number(id))}
          exportFilename="crops"
        />
      )}

      <ResourceFormSheet
        open={showForm}
        onOpenChange={(o) => (o ? setShowForm(true) : closeForm())}
        title="crop"
        description="Capture identity, category and growing season."
        isEditing={!!editing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      >
        <div>
          <Label htmlFor="name">Crop name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Wheat" disabled={isSubmitting} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="local_name">Local name</Label>
          <Input id="local_name" {...register('local_name')} placeholder="e.g. गेहूं" disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="scientific_name">Scientific name</Label>
          <Input id="scientific_name" {...register('scientific_name')} placeholder="Triticum aestivum" disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Category *</Label>
            <Select value={watch('category')} onValueChange={(v) => setValue('category', v as any)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Growing season *</Label>
            <Select value={watch('growing_season')} onValueChange={(v) => setValue('growing_season', v as any)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} placeholder="Notes about the crop…" rows={4} disabled={isSubmitting} />
        </div>
      </ResourceFormSheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete crop"
        description="This will remove the crop and unlink any varieties or symptoms tied to it. This action cannot be undone."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

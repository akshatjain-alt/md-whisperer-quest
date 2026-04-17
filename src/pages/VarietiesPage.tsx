import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Variety {
  id: number;
  crop_id: number;
  variety_name: string;
  variety_name_local?: string;
  maturity_days?: number;
  yield_per_acre?: string;
  characteristics?: string;
  description?: string;
}

const schema = z.object({
  crop_id: z.number().min(1, 'Please select a crop'),
  variety_name: z.string().min(2, 'Variety name must be at least 2 characters'),
  variety_name_local: z.string().optional(),
  maturity_days: z.number().optional(),
  yield_per_acre: z.string().optional(),
  characteristics: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const columns: Column<Variety>[] = [
  { key: 'variety_name', label: 'Variety Name', render: (v) => <span className="font-medium">{v.variety_name}</span> },
  { key: 'variety_name_local', label: 'Local Name', render: (v) => <span>{v.variety_name_local || '-'}</span> },
  { key: 'maturity_days', label: 'Maturity Days', render: (v) => <Badge variant="outline" className="text-xs">{v.maturity_days || 'N/A'}</Badge> },
  { key: 'yield_per_acre', label: 'Yield/Acre', render: (v) => <Badge variant="secondary" className="text-xs">{v.yield_per_acre || 'N/A'}</Badge> },
];

export default function VarietiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Variety | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<number | undefined>();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Fetch crops for dropdown
  const { data: crops = [] } = useQuery({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops(),
  });

  // Fetch varieties
  const { data: varieties = [], isLoading } = useQuery({
    queryKey: ['varieties', selectedCropId],
    queryFn: () => apiService.getAll('varieties'),
  });

  // Filter varieties by selected crop if needed
  const filteredVarieties = selectedCropId 
    ? varieties.filter((v: Variety) => v.crop_id === selectedCropId)
    : varieties;

  // Create variety mutation
  const createMutation = useMutation({
    mutationFn: (data) => apiService.create('varieties', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varieties'] });
      toast({ title: 'Variety added successfully' });
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to add variety', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  // Update variety mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => apiService.update('varieties', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varieties'] });
      toast({ title: 'Variety updated successfully' });
      setShowForm(false);
      setEditing(null);
      reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update variety', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  // Delete variety mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.delete('varieties', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['varieties'] });
      toast({ title: 'Variety deleted successfully' });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to delete variety', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  const openNew = () => {
    setEditing(null);
    reset({ 
      crop_id: undefined,
      variety_name: '', 
      variety_name_local: '', 
      maturity_days: undefined,
      yield_per_acre: '',
      characteristics: '',
      description: '',
    });
    setShowForm(true);
  };

  const openEdit = (variety: Variety) => {
    setEditing(variety);
    reset({
      crop_id: variety.crop_id,
      variety_name: variety.variety_name,
      variety_name_local: variety.variety_name_local || '',
      maturity_days: variety.maturity_days,
      yield_per_acre: variety.yield_per_acre || '',
      characteristics: variety.characteristics || '',
      description: variety.description || '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🧬 Crop Varieties Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage crop variety database entries</p>
        </div>
        <div className="flex gap-3">
          <Select onValueChange={(v) => setSelectedCropId(v ? Number(v) : undefined)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              {crops.map((crop: any) => (
                <SelectItem key={crop.id} value={String(crop.id)}>{crop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light">
            <Plus size={16} className="mr-2" /> Add New Variety
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading varieties...</span>
        </div>
      ) : (
        <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_400px]' : ''}`}>
          <DataTable
            data={filteredVarieties}
            columns={columns}
            searchKeys={['variety_name', 'variety_name_local']}
            onEdit={openEdit}
            onDelete={(id) => setDeleteId(Number(id))}
          />

          {showForm && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Variety' : 'Add New Variety'}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Related Crop *</Label>
                  <Select defaultValue={editing?.crop_id?.toString()} onValueChange={(v) => setValue('crop_id', Number(v))} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                    <SelectContent>
                      {crops.map((crop: any) => <SelectItem key={crop.id} value={String(crop.id)}>{crop.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.crop_id && <p className="text-xs text-destructive mt-1">{errors.crop_id.message}</p>}
                </div>
                <div>
                  <Label>Variety Name *</Label>
                  <Input {...register('variety_name')} placeholder="Enter variety name" disabled={isSubmitting} />
                  {errors.variety_name && <p className="text-xs text-destructive mt-1">{errors.variety_name.message}</p>}
                </div>
                <div>
                  <Label>Local Name (Hindi)</Label>
                  <Input {...register('variety_name_local')} placeholder="स्थानीय नाम" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Maturity Days</Label>
                  <Input {...register('maturity_days', { valueAsNumber: true })} type="number" placeholder="e.g., 120" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Yield per Acre</Label>
                  <Input {...register('yield_per_acre')} placeholder="e.g., 30-35 quintals" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Characteristics</Label>
                  <Input {...register('characteristics')} placeholder="Key characteristics" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...register('description')} placeholder="Describe the variety..." rows={3} disabled={isSubmitting} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editing ? 'Update' : 'Save Variety'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Variety"
        description="Are you sure you want to delete this variety? This action cannot be undone."
        onConfirm={() => { 
          if (deleteId) {
            deleteMutation.mutate(deleteId);
          }
        }}
      />
    </div>
  );
}
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

interface Crop {
  id: number;
  name: string;
  local_name?: string;
  scientific_name?: string;
  category?: string;
  growing_season?: string;
  description?: string;
  image_url?: string;
}

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  local_name: z.string().optional(),
  scientific_name: z.string().optional(),
  category: z.enum(['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Fiber', 'Oilseed', 'Cash Crop']),
  growing_season: z.enum(['Kharif', 'Rabi', 'Zaid', 'All Year']),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CATEGORIES = ['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Fiber', 'Oilseed', 'Cash Crop'] as const;
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'All Year'] as const;

const columns: Column<Crop>[] = [
  { key: 'name', label: 'Name', render: (c) => <span className="font-medium">{c.name}</span> },
  { key: 'local_name', label: 'Local Name', render: (c) => <span>{c.local_name || '-'}</span> },
  { key: 'category', label: 'Category', render: (c) => <Badge variant="outline" className="text-xs">{c.category || 'N/A'}</Badge> },
  { key: 'growing_season', label: 'Season', render: (c) => <Badge variant="secondary" className="text-xs">{c.growing_season || 'N/A'}</Badge> },
];

export default function CropsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Crop | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Fetch crops
  const { data: crops = [], isLoading } = useQuery({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops(),
  });

  // Create crop mutation
  const createMutation = useMutation({
    mutationFn: (data) => apiService.createCrop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({ title: 'Crop added successfully' });
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to add crop', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  // Update crop mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => apiService.updateCrop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({ title: 'Crop updated successfully' });
      setShowForm(false);
      setEditing(null);
      reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update crop', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  // Delete crop mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.deleteCrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      toast({ title: 'Crop deleted successfully' });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to delete crop', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
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
          <h1 className="text-2xl font-bold text-foreground">🌱 Crops Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage crop database entries</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light">
          <Plus size={16} className="mr-2" /> Add New Crop
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading crops...</span>
        </div>
      ) : (
        <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_400px]' : ''}`}>
          <DataTable
            data={crops}
            columns={columns}
            searchKeys={['name', 'local_name', 'category']}
            onEdit={openEdit}
            onDelete={(id) => setDeleteId(Number(id))}
          />

          {showForm && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Crop' : 'Add New Crop'}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Crop Name *</Label>
                  <Input {...register('name')} placeholder="Enter crop name" disabled={isSubmitting} />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label>Local Name (Hindi)</Label>
                  <Input {...register('local_name')} placeholder="स्थानीय नाम" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Scientific Name</Label>
                  <Input {...register('scientific_name')} placeholder="Latin name" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select defaultValue={editing?.category || 'Cereal'} onValueChange={(v) => setValue('category', v as any)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Growing Season *</Label>
                  <Select defaultValue={editing?.growing_season || 'Kharif'} onValueChange={(v) => setValue('growing_season', v as any)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEASONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...register('description')} placeholder="Describe the crop..." rows={3} disabled={isSubmitting} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editing ? 'Update' : 'Save Crop'}
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
        title="Delete Crop"
        description="Are you sure you want to delete this crop? This action cannot be undone."
        onConfirm={() => { 
          if (deleteId) {
            deleteMutation.mutate(deleteId);
          }
        }}
      />
    </div>
  );
}
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Prescription } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  diagnosis_id: z.number(),
  product_id: z.number(),
  dosage_per_acre: z.string().optional(),
  dosage_per_bigha: z.string().optional(),
  application_method: z.string().optional(),
  frequency: z.string().optional(),
  precautions: z.string().optional(),
  waiting_period_days: z.number().optional(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Prescription>[] = [
  { key: 'id', label: 'ID' },
  { key: 'diagnosis_id', label: 'Diagnosis ID' },
  { key: 'product_id', label: 'Product ID' },
  { key: 'dosage_per_acre', label: 'Dosage/Acre' },
  { key: 'application_method', label: 'Method' },
];

export default function PrescriptionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Prescription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Fetch data
  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const response = await apiService.get('/prescriptions');
      return response.data?.data || [];
    }
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: async () => {
      const response = await apiService.get('/diagnoses');
      return response.data?.data || [];
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiService.get('/products');
      return response.data?.data || [];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiService.post('/prescriptions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({ title: 'Prescription added successfully' });
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to add prescription', variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiService.put(`/prescriptions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({ title: 'Prescription updated successfully' });
      setShowForm(false);
      setEditing(null);
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update prescription', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete('prescriptions', id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      toast({ title: 'Prescription deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete prescription', variant: 'destructive' });
    }
  });

  const openNew = () => { 
    setEditing(null); 
    reset({}); 
    setShowForm(true); 
  };
  
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

  const onSubmit = (data: FormData) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Prescriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage treatment prescriptions</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light"><Plus size={16} className="mr-2" /> Add Prescription</Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_420px]' : ''}`}>
        <DataTable 
          data={prescriptions} 
          columns={columns} 
          searchKeys={['diagnosis_id', 'product_id']} 
          onEdit={openEdit} 
          onDelete={(id) => setDeleteId(Number(id))} 
        />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Prescription</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Diagnosis *</Label>
                <Select 
                  defaultValue={editing?.diagnosis_id?.toString()} 
                  onValueChange={(v) => setValue('diagnosis_id', Number(v))}
                >
                  <SelectTrigger><SelectValue placeholder="Select diagnosis" /></SelectTrigger>
                  <SelectContent>
                    {diagnoses.map((d: any) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.diagnosis_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.diagnosis_id && <p className="text-xs text-destructive mt-1">{errors.diagnosis_id.message}</p>}
              </div>

              <div>
                <Label>Product *</Label>
                <Select 
                  defaultValue={editing?.product_id?.toString()} 
                  onValueChange={(v) => setValue('product_id', Number(v))}
                >
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.product_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.product_id && <p className="text-xs text-destructive mt-1">{errors.product_id.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Dosage per Acre</Label>
                  <Input {...register('dosage_per_acre')} placeholder="e.g., 200ml" />
                </div>
                <div>
                  <Label>Dosage per Bigha</Label>
                  <Input {...register('dosage_per_bigha')} placeholder="e.g., 80ml" />
                </div>
              </div>

              <div>
                <Label>Application Method</Label>
                <Input {...register('application_method')} placeholder="e.g., Foliar spray" />
              </div>

              <div>
                <Label>Frequency</Label>
                <Input {...register('frequency')} placeholder="e.g., Once every 15 days" />
              </div>

              <div>
                <Label>Waiting Period (days)</Label>
                <Input type="number" {...register('waiting_period_days', { valueAsNumber: true })} />
              </div>

              <div>
                <Label>Precautions</Label>
                <Textarea {...register('precautions')} rows={2} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1">Cancel</Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editing ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={() => setDeleteId(null)} 
        title="Delete Prescription" 
        description="Are you sure? This action cannot be undone." 
        onConfirm={handleDelete} 
      />
    </div>
  );
}
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Diagnosis } from '@/types';
import DataTable, { Column } from '@/components/DataTable';
import ConfirmDialog from '@/components/ConfirmDialog';
import SeverityBadge from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  diagnosis_name: z.string().min(2),
  diagnosis_name_local: z.string().optional(),
  disease_type: z.enum(['Fungal', 'Bacterial', 'Viral', 'Pest', 'Deficiency', 'Other']),
  causative_agent: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['Mild', 'Moderate', 'Severe']),
  spread_rate: z.enum(['Slow', 'Medium', 'Fast']),
  favorable_conditions: z.string().optional(),
  prevention_tips: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Diagnosis>[] = [
  { key: 'diagnosis_name', label: 'Diagnosis', render: (d) => <span className="font-medium">{d.diagnosis_name}</span> },
  { key: 'diagnosis_name_local', label: 'Local Name' },
  { key: 'disease_type', label: 'Type', render: (d) => <Badge variant="outline" className="text-xs">{d.disease_type}</Badge> },
  { key: 'severity', label: 'Severity', render: (d) => <SeverityBadge level={d.severity} /> },
  { key: 'spread_rate', label: 'Spread', render: (d) => <SeverityBadge level={d.spread_rate} /> },
];

export default function DiagnosesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Diagnosis | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Fetch diagnoses from backend
  const { data: diagnoses = [], isLoading } = useQuery({
    queryKey: ['diagnoses'],
    queryFn: async () => {
      const response = await apiService.get('/diagnoses');
      return response.data?.data || [];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiService.post('/diagnoses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
      toast({ title: 'Diagnosis added successfully' });
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to add diagnosis', variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await apiService.put(`/diagnoses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
      toast({ title: 'Diagnosis updated successfully' });
      setShowForm(false);
      setEditing(null);
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update diagnosis', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete('diagnoses', id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses'] });
      toast({ title: 'Diagnosis deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete diagnosis', variant: 'destructive' });
    }
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
      disease_type: d.disease_type as any,
      causative_agent: d.causative_agent || '',
      description: d.description || '',
      severity: d.severity as any,
      spread_rate: d.spread_rate as any,
      favorable_conditions: d.favorable_conditions || '',
      prevention_tips: d.prevention_tips || ''
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
          <h1 className="text-2xl font-bold">🩺 Diagnoses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage disease and diagnosis entries</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light"><Plus size={16} className="mr-2" /> Add Diagnosis</Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_420px]' : ''}`}>
        <DataTable 
          data={diagnoses} 
          columns={columns as any} 
          searchKeys={['diagnosis_name', 'diagnosis_name_local', 'disease_type']} 
          onEdit={openEdit as any} 
          onDelete={(id) => setDeleteId(Number(id))} 
        />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Diagnosis</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input {...register('diagnosis_name')} />
                {errors.diagnosis_name && <p className="text-xs text-destructive mt-1">{errors.diagnosis_name.message}</p>}
              </div>
              <div>
                <Label>Local Name</Label>
                <Input {...register('diagnosis_name_local')} />
              </div>
              <div>
                <Label>Disease Type</Label>
                <Select defaultValue={editing?.disease_type || 'Fungal'} onValueChange={(v) => setValue('disease_type', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Fungal','Bacterial','Viral','Pest','Deficiency','Other'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Causative Agent</Label>
                <Input {...register('causative_agent')} placeholder="Scientific name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Severity</Label>
                  <Select defaultValue={editing?.severity || 'Moderate'} onValueChange={(v) => setValue('severity', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Mild','Moderate','Severe'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spread Rate</Label>
                  <Select defaultValue={editing?.spread_rate || 'Medium'} onValueChange={(v) => setValue('spread_rate', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Slow','Medium','Fast'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Favorable Conditions</Label>
                <Textarea {...register('favorable_conditions')} rows={2} />
              </div>
              <div>
                <Label>Prevention Tips</Label>
                <Textarea {...register('prevention_tips')} rows={2} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} rows={2} />
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
        title="Delete Diagnosis" 
        description="Are you sure? This action cannot be undone." 
        onConfirm={handleDelete} 
      />
    </div>
  );
}
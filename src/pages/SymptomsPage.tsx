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

interface Symptom {
  id: number;
  crop_id?: number;
  symptom_name: string;
  symptom_name_local?: string;
  description?: string;
  affected_part?: string;
  visual_indicators?: string;
  stage_of_crop?: string;
  severity_level?: string;
  image_url?: string;
}

const schema = z.object({
  symptom_name: z.string().min(2, 'Name must be at least 2 characters'),
  symptom_name_local: z.string().optional(),
  crop_id: z.number().optional(),
  description: z.string().optional(),
  affected_part: z.string().optional(),
  visual_indicators: z.string().optional(),
  stage_of_crop: z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'All Stages']).optional(),
  severity_level: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
});

type FormData = z.infer<typeof schema>;

const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'All Stages'] as const;
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
const AFFECTED_PARTS = ['Leaf', 'Stem', 'Root', 'Fruit', 'Flower', 'Whole Plant'] as const;

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case 'Low': return 'bg-green-100 text-green-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    case 'High': return 'bg-orange-100 text-orange-700';
    case 'Critical': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const columns: Column<Symptom>[] = [
  { key: 'symptom_name', label: 'Symptom', render: (s) => <span className="font-medium">{s.symptom_name}</span> },
  { key: 'symptom_name_local', label: 'Local Name', render: (s) => <span>{s.symptom_name_local || '-'}</span> },
  { key: 'severity_level', label: 'Severity', render: (s) => <Badge className={`text-xs ${getSeverityColor(s.severity_level)}`}>{s.severity_level || 'N/A'}</Badge> },
  { key: 'stage_of_crop', label: 'Stage', render: (s) => <Badge variant="outline" className="text-xs">{s.stage_of_crop || 'N/A'}</Badge> },
  { key: 'affected_part', label: 'Affected Part', render: (s) => <Badge variant="secondary" className="text-xs">{s.affected_part || 'N/A'}</Badge> },
];

export default function SymptomsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Symptom | null>(null);
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

  // Fetch symptoms
  const { data: symptoms = [], isLoading } = useQuery({
    queryKey: ['symptoms', selectedCropId],
    queryFn: () => apiService.getSymptoms(selectedCropId),
  });

  // Create symptom mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiService.createSymptom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast({ title: 'Symptom added successfully' });
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to add symptom', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  // Update symptom mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => apiService.updateSymptom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast({ title: 'Symptom updated successfully' });
      setShowForm(false);
      setEditing(null);
      reset();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to update symptom', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  // Delete symptom mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteSymptom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast({ title: 'Symptom deleted successfully' });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to delete symptom', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  const openNew = () => {
    setEditing(null);
    reset({ 
      symptom_name: '', 
      symptom_name_local: '', 
      stage_of_crop: 'Vegetative', 
      severity_level: 'Medium',
      affected_part: 'Leaf',
    });
    setShowForm(true);
  };

  const openEdit = (symptom: Symptom) => {
    setEditing(symptom);
    reset({
      symptom_name: symptom.symptom_name,
      symptom_name_local: symptom.symptom_name_local || '',
      crop_id: symptom.crop_id,
      description: symptom.description || '',
      affected_part: symptom.affected_part || 'Leaf',
      visual_indicators: symptom.visual_indicators || '',
      stage_of_crop: (symptom.stage_of_crop as any) || 'Vegetative',
      severity_level: (symptom.severity_level as any) || 'Medium',
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
          <h1 className="text-2xl font-bold text-foreground">🔍 Symptoms Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage crop symptom database</p>
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
            <Plus size={16} className="mr-2" /> Add New Symptom
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading symptoms...</span>
        </div>
      ) : (
        <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_400px]' : ''}`}>
          <DataTable
            data={symptoms}
            columns={columns as any}
            searchKeys={['symptom_name', 'symptom_name_local', 'affected_part']}
            onEdit={openEdit as any}
            onDelete={(id) => setDeleteId(Number(id))}
          />

          {showForm && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Symptom' : 'Add New Symptom'}</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Symptom Name *</Label>
                  <Input {...register('symptom_name')} placeholder="Enter symptom name" disabled={isSubmitting} />
                  {errors.symptom_name && <p className="text-xs text-destructive mt-1">{errors.symptom_name.message}</p>}
                </div>
                <div>
                  <Label>Local Name (Hindi)</Label>
                  <Input {...register('symptom_name_local')} placeholder="स्थानीय नाम" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Related Crop</Label>
                  <Select defaultValue={editing?.crop_id?.toString()} onValueChange={(v) => setValue('crop_id', v ? Number(v) : undefined)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (General)</SelectItem>
                      {crops.map((crop: any) => <SelectItem key={crop.id} value={String(crop.id)}>{crop.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Affected Part *</Label>
                  <Select defaultValue={editing?.affected_part || 'Leaf'} onValueChange={(v) => setValue('affected_part', v)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AFFECTED_PARTS.map((part) => <SelectItem key={part} value={part}>{part}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Crop Stage *</Label>
                  <Select defaultValue={editing?.stage_of_crop || 'Vegetative'} onValueChange={(v) => setValue('stage_of_crop', v as any)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity Level *</Label>
                  <Select defaultValue={editing?.severity_level || 'Medium'} onValueChange={(v) => setValue('severity_level', v as any)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEVERITY_LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Visual Indicators</Label>
                  <Input {...register('visual_indicators')} placeholder="What does it look like?" disabled={isSubmitting} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...register('description')} placeholder="Describe the symptom..." rows={3} disabled={isSubmitting} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1" disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editing ? 'Update' : 'Save Symptom'}
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
        title="Delete Symptom"
        description="Are you sure you want to delete this symptom? This action cannot be undone."
        onConfirm={() => { 
          if (deleteId) {
            deleteMutation.mutate(deleteId);
          }
        }}
      />
    </div>
  );
}
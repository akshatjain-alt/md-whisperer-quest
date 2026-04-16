import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
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
  name: z.string().min(2),
  local_name: z.string().optional(),
  disease_type: z.enum(['Fungal', 'Bacterial', 'Viral', 'Pest', 'Deficiency']),
  causative_agent: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['Mild', 'Moderate', 'Severe']),
  spread_rate: z.enum(['Slow', 'Medium', 'Fast']),
  favorable_conditions: z.string().optional(),
  prevention_tips: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Diagnosis>[] = [
  { key: 'name', label: 'Diagnosis', render: (d) => <span className="font-medium">{d.name}</span> },
  { key: 'local_name', label: 'Local Name' },
  { key: 'disease_type', label: 'Type', render: (d) => <Badge variant="outline" className="text-xs">{d.disease_type}</Badge> },
  { key: 'severity', label: 'Severity', render: (d) => <SeverityBadge level={d.severity} /> },
  { key: 'spread_rate', label: 'Spread', render: (d) => <SeverityBadge level={d.spread_rate} /> },
];

export default function DiagnosesPage() {
  const { diagnoses, addDiagnosis, updateDiagnosis, deleteDiagnosis } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Diagnosis | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openNew = () => { setEditing(null); reset({ name: '', disease_type: 'Fungal', severity: 'Moderate', spread_rate: 'Medium' }); setShowForm(true); };
  const openEdit = (d: Diagnosis) => { setEditing(d); reset(d); setShowForm(true); };

  const onSubmit = (data: FormData) => {
    if (editing) { updateDiagnosis(editing.id, data); toast({ title: 'Updated' }); }
    else { addDiagnosis(data as Omit<Diagnosis, 'id' | 'created_at'>); toast({ title: 'Diagnosis added' }); }
    setShowForm(false);
  };

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
        <DataTable data={diagnoses} columns={columns} searchKeys={['name', 'local_name', 'disease_type']} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'Add'} Diagnosis</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><Label>Name *</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
              <div><Label>Local Name</Label><Input {...register('local_name')} /></div>
              <div><Label>Disease Type</Label>
                <Select defaultValue={editing?.disease_type || 'Fungal'} onValueChange={(v) => setValue('disease_type', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Fungal','Bacterial','Viral','Pest','Deficiency'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Causative Agent</Label><Input {...register('causative_agent')} placeholder="Scientific name" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Severity</Label>
                  <Select defaultValue={editing?.severity || 'Moderate'} onValueChange={(v) => setValue('severity', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Mild','Moderate','Severe'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Spread Rate</Label>
                  <Select defaultValue={editing?.spread_rate || 'Medium'} onValueChange={(v) => setValue('spread_rate', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['Slow','Medium','Fast'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Favorable Conditions</Label><Textarea {...register('favorable_conditions')} rows={2} /></div>
              <div><Label>Prevention Tips</Label><Textarea {...register('prevention_tips')} rows={2} /></div>
              <div><Label>Description</Label><Textarea {...register('description')} rows={2} /></div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light">{editing ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Diagnosis" description="Are you sure?" onConfirm={() => { deleteDiagnosis(deleteId!); setDeleteId(null); toast({ title: 'Deleted' }); }} />
    </div>
  );
}

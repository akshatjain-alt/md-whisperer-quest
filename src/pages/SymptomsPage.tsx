import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Symptom } from '@/types';
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
  crop_id: z.string().optional(),
  description: z.string().optional(),
  crop_stage: z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting']),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
});
type FormData = z.infer<typeof schema>;

const columns: Column<Symptom>[] = [
  { key: 'name', label: 'Symptom', render: (s) => <span className="font-medium">{s.name}</span> },
  { key: 'local_name', label: 'Local Name' },
  { key: 'severity', label: 'Severity', render: (s) => <SeverityBadge level={s.severity} /> },
  { key: 'crop_stage', label: 'Crop Stage', render: (s) => <Badge variant="outline" className="text-xs">{s.crop_stage}</Badge> },
  { key: 'affected_part', label: 'Affected Parts', render: (s) => (
    <div className="flex flex-wrap gap-1">{s.affected_part.map((p) => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}</div>
  )},
];

export default function SymptomsPage() {
  const { symptoms, addSymptom, updateSymptom, deleteSymptom, crops } = useStore();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Symptom | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [affectedParts, setAffectedParts] = useState<string[]>([]);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [indicatorInput, setIndicatorInput] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const PARTS = ['Leaf', 'Stem', 'Root', 'Fruit', 'Flower'];

  const openNew = () => {
    setEditing(null);
    setAffectedParts([]);
    setIndicators([]);
    reset({ name: '', local_name: '', description: '', crop_stage: 'Vegetative', severity: 'Medium' });
    setShowForm(true);
  };

  const openEdit = (s: Symptom) => {
    setEditing(s);
    setAffectedParts(s.affected_part);
    setIndicators(s.visual_indicators);
    reset(s);
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = { ...data, affected_part: affectedParts, visual_indicators: indicators, crop_id: data.crop_id || '' } as Omit<Symptom, 'id' | 'created_at'>;
    if (editing) {
      updateSymptom(editing.id, payload);
      toast({ title: 'Symptom updated' });
    } else {
      addSymptom(payload);
      toast({ title: 'Symptom added' });
    }
    setShowForm(false);
  };

  const togglePart = (p: string) => setAffectedParts((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const addIndicator = () => {
    if (indicatorInput.trim()) {
      setIndicators((prev) => [...prev, indicatorInput.trim()]);
      setIndicatorInput('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🔍 Symptoms</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage crop symptom entries</p>
        </div>
        <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary-light">
          <Plus size={16} className="mr-2" /> Add Symptom
        </Button>
      </div>

      <div className={`grid gap-6 ${showForm ? 'lg:grid-cols-[1fr_420px]' : ''}`}>
        <DataTable data={symptoms} columns={columns} searchKeys={['name', 'local_name']} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Symptom' : 'Add Symptom'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Symptom Name *</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Local Name</Label>
                <Input {...register('local_name')} />
              </div>
              <div>
                <Label>Crop</Label>
                <Select onValueChange={(v) => setValue('crop_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>
                    {crops.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Affected Parts</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {PARTS.map((p) => (
                    <Badge
                      key={p}
                      variant={affectedParts.includes(p) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => togglePart(p)}
                    >{p}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Visual Indicators</Label>
                <div className="flex gap-2">
                  <Input value={indicatorInput} onChange={(e) => setIndicatorInput(e.target.value)} placeholder="e.g. yellow spots" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIndicator(); }}} />
                  <Button type="button" variant="outline" onClick={addIndicator}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {indicators.map((ind, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setIndicators((p) => p.filter((_, j) => j !== i))}>
                      {ind} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Crop Stage</Label>
                  <Select defaultValue={editing?.crop_stage || 'Vegetative'} onValueChange={(v) => setValue('crop_stage', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Seedling', 'Vegetative', 'Flowering', 'Fruiting'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select defaultValue={editing?.severity || 'Medium'} onValueChange={(v) => setValue('severity', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Critical'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea {...register('description')} rows={3} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-light">{editing ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Symptom" description="Are you sure?" onConfirm={() => { deleteSymptom(deleteId!); setDeleteId(null); toast({ title: 'Deleted' }); }} />
    </div>
  );
}

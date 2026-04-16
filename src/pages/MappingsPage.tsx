import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MappingsPage() {
  const { symptoms, diagnoses, mappings, addMapping, deleteMapping } = useStore();
  const { toast } = useToast();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [confidence, setConfidence] = useState([80]);

  const handleCreate = () => {
    if (!selectedSymptom || !selectedDiagnosis) { toast({ title: 'Select both symptom and diagnosis', variant: 'destructive' }); return; }
    addMapping({ symptom_id: selectedSymptom, diagnosis_id: selectedDiagnosis, confidence: confidence[0] });
    toast({ title: 'Mapping created' });
    setSelectedSymptom('');
    setSelectedDiagnosis('');
    setConfidence([80]);
  };

  const getSymptomName = (id: string) => symptoms.find((s) => s.id === id)?.name || 'Unknown';
  const getDiagnosisName = (id: string) => diagnoses.find((d) => d.id === id)?.name || 'Unknown';

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🔗 Symptom-Diagnosis Links</h1>
        <p className="text-sm text-muted-foreground mt-1">Map symptoms to possible diagnoses with confidence scores</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="text-lg font-semibold">Create New Mapping</h2>

          <div>
            <Label>Step 1: Select Symptom</Label>
            <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a symptom..." /></SelectTrigger>
              <SelectContent>{symptoms.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Step 2: Select Diagnosis</Label>
            <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a diagnosis..." /></SelectTrigger>
              <SelectContent>{diagnoses.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Step 3: Confidence Score — {confidence[0]}%</Label>
            <Slider value={confidence} onValueChange={setConfidence} max={100} min={0} step={5} className="mt-3" />
          </div>

          <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground hover:bg-primary-light">
            <Plus size={16} className="mr-2" /> Create Mapping
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Existing Mappings ({mappings.length})</h2>
          {mappings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No mappings created yet</p>
          ) : (
            <div className="space-y-3">
              {mappings.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {getSymptomName(m.symptom_id)} → {getDiagnosisName(m.diagnosis_id)}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{m.confidence}%</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => { deleteMapping(m.id); toast({ title: 'Deleted' }); }}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

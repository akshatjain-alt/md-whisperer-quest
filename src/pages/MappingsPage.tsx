import { useMemo, useState } from 'react';
import { Plus, X, Link2, Search, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import type { Symptom, Diagnosis, SymptomDiagnosisMapping } from '@/types';
import PageHeader from '@/components/expert/PageHeader';
import LoadingState from '@/components/expert/LoadingState';
import EmptyState from '@/components/expert/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useResourceMutations } from '@/hooks/useResourceMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FormPayload {
  symptom_id: number;
  diagnosis_id: number;
}

export default function MappingsPage() {
  const { toast } = useToast();
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: symptoms = [], isLoading: lSym } = useQuery<Symptom[]>({
    queryKey: ['symptoms'],
    queryFn: async () => (await apiService.get('/symptoms')).data?.data || [],
  });
  const { data: diagnoses = [], isLoading: lDx } = useQuery<Diagnosis[]>({
    queryKey: ['diagnoses'],
    queryFn: async () => (await apiService.get('/diagnoses')).data?.data || [],
  });
  const { data: mappings = [], isLoading: lMap } = useQuery<SymptomDiagnosisMapping[]>({
    queryKey: ['mappings'],
    queryFn: async () => (await apiService.get('/mappings')).data?.data || [],
  });

  const symptomsById = useMemo(() => new Map(symptoms.map((s) => [s.id, s.symptom_name])), [symptoms]);
  const diagnosesById = useMemo(() => new Map(diagnoses.map((d) => [d.id, d.diagnosis_name])), [diagnoses]);

  const { createMutation, deleteMutation } = useResourceMutations<SymptomDiagnosisMapping, FormPayload>({
    queryKey: ['mappings'],
    label: 'Mapping',
    create: async (data) => (await apiService.post('/mappings', data)).data,
    update: async ({ id, data }) => (await apiService.put(`/mappings/${id}`, data)).data,
    remove: (id) => apiService.delete('mappings', id),
    onCreated: () => { setSelectedSymptom(''); setSelectedDiagnosis(''); },
    onRemoved: () => setDeleteId(null),
  });

  const filteredMappings = useMemo(() => {
    if (!search.trim()) return mappings;
    const q = search.toLowerCase();
    return mappings.filter((m) => {
      const sName = (symptomsById.get(m.symptom_id) || '').toLowerCase();
      const dName = (diagnosesById.get(m.diagnosis_id) || '').toLowerCase();
      return sName.includes(q) || dName.includes(q);
    });
  }, [mappings, search, symptomsById, diagnosesById]);

  // Existing pairs to disable duplicates in selectors.
  const existingPair = useMemo(() => {
    const set = new Set<string>();
    mappings.forEach((m) => set.add(`${m.symptom_id}:${m.diagnosis_id}`));
    return set;
  }, [mappings]);

  const handleAdd = () => {
    if (!selectedSymptom || !selectedDiagnosis) {
      toast({ title: 'Pick both a symptom and a diagnosis', variant: 'destructive' });
      return;
    }
    const key = `${selectedSymptom}:${selectedDiagnosis}`;
    if (existingPair.has(key)) {
      toast({ title: 'That mapping already exists', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ symptom_id: Number(selectedSymptom), diagnosis_id: Number(selectedDiagnosis) });
  };

  const isLoading = lSym || lDx || lMap;

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Link2}
        title="Symptom ↔ Diagnosis mappings"
        description="Connect observable symptoms to the diagnoses they signal."
        count={mappings.length}
        countLabel="links"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="text-base">Existing mappings</CardTitle>
            <div className="relative w-full max-w-[220px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="h-8 pl-8 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState label="Loading mappings…" />
            ) : filteredMappings.length === 0 ? (
              <EmptyState
                icon={Link2}
                title={mappings.length === 0 ? 'No mappings yet' : 'No matches'}
                description={mappings.length === 0
                  ? 'Connect symptoms to diagnoses so the field diagnosis flow can match them.'
                  : 'Adjust your search to find an existing link.'}
              />
            ) : (
              <ul className="divide-y divide-border">
                {filteredMappings.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0 text-sm">
                      <span className="font-medium truncate">{symptomsById.get(m.symptom_id) || `Symptom #${m.symptom_id}`}</span>
                      <span className="text-muted-foreground shrink-0">→</span>
                      <span className="truncate text-muted-foreground">{diagnosesById.get(m.diagnosis_id) || `Diagnosis #${m.diagnosis_id}`}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => setDeleteId(m.id)}
                      aria-label="Remove mapping"
                    >
                      <X size={14} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus size={16} className="text-role-expert" /> New mapping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-1.5"><Search size={12} /> Symptom</Label>
              <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                <SelectTrigger><SelectValue placeholder="Select symptom" /></SelectTrigger>
                <SelectContent>
                  {symptoms.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.symptom_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="flex items-center gap-1.5"><Stethoscope size={12} /> Diagnosis</Label>
              <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                <SelectTrigger><SelectValue placeholder="Select diagnosis" /></SelectTrigger>
                <SelectContent>
                  {diagnoses.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.diagnosis_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={createMutation.isPending || !selectedSymptom || !selectedDiagnosis}
            >
              <Plus size={14} className="mr-1.5" />
              {createMutation.isPending ? 'Linking…' : 'Add mapping'}
            </Button>
            {symptoms.length === 0 || diagnoses.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add at least one symptom and diagnosis first.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Remove mapping"
        description="The link between this symptom and diagnosis will be removed. You can re-add it later."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Mapping {
  id: number;
  symptom_id: number;
  diagnosis_id: number;
}

export default function MappingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedSymptom, setSelectedSymptom] = useState<string>('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');

  // Fetch data
  const { data: symptoms = [] } = useQuery({
    queryKey: ['symptoms'],
    queryFn: async () => {
      const response = await apiService.get('/symptoms');
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

  const { data: mappings = [] } = useQuery({
    queryKey: ['mappings'],
    queryFn: async () => {
      const response = await apiService.get('/mappings');
      return response.data?.data || [];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: { symptom_id: number; diagnosis_id: number }) => {
      const response = await apiService.post('/mappings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      toast({ title: 'Mapping added successfully' });
      setSelectedSymptom('');
      setSelectedDiagnosis('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to add mapping', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiService.delete('mappings', id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      toast({ title: 'Mapping removed successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to remove mapping', variant: 'destructive' });
    }
  });

  const handleAdd = () => {
    if (!selectedSymptom || !selectedDiagnosis) {
      toast({ title: 'Error', description: 'Please select both symptom and diagnosis', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ symptom_id: Number(selectedSymptom), diagnosis_id: Number(selectedDiagnosis) });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🔗 Symptom-Diagnosis Mappings</h1>
        <p className="text-sm text-muted-foreground mt-1">Link symptoms to diagnoses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Current Mappings</CardTitle>
          </CardHeader>
          <CardContent>
            {mappings.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No mappings yet</p>
            ) : (
              <div className="space-y-2">
                {mappings.map((m: Mapping) => {
                  const symptom = symptoms.find((s: any) => s.id === m.symptom_id);
                  const diagnosis = diagnoses.find((d: any) => d.id === m.diagnosis_id);
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{symptom?.symptom_name || 'Unknown'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm">{diagnosis?.diagnosis_name || 'Unknown'}</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteMutation.mutate(m.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Symptom</label>
              <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select symptom" />
                </SelectTrigger>
                <SelectContent>
                  {symptoms.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.symptom_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Diagnosis</label>
              <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                <SelectTrigger>
                  <SelectValue placeholder="Select diagnosis" />
                </SelectTrigger>
                <SelectContent>
                  {diagnoses.map((d: any) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.diagnosis_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAdd} 
              className="w-full"
              disabled={createMutation.isPending || !selectedSymptom || !selectedDiagnosis}
            >
              <Plus size={16} className="mr-2" />
              Add Mapping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
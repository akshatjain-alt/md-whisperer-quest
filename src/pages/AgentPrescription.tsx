import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Search, 
  User, 
  Sprout,
  Dna,
  Eye,
  Stethoscope,
  FileText,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Customer {
  id: number;
  customer_code: string;
  full_name: string;
  village: string;
  district: string;
}

interface Crop {
  id: number;
  name: string;
  name_local?: string;
}

interface Variety {
  id: number;
  variety_name: string;
  crop_id: number;
}

interface Symptom {
  id: number;
  symptom_name: string;
  symptom_name_local?: string;
  affected_part: string[];
}

interface Diagnosis {
  id: number;
  diagnosis_name: string;
  diagnosis_name_local?: string;
  disease_type: string;
  severity: string;
}

interface Product {
  id: number;
  product_name: string;
  selling_price: number;
  stock_quantity: number;
}

export default function AgentPrescription() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Workflow steps: 1=Customer, 2=Crop, 3=Variety, 4=Symptoms, 5=Diagnosis, 6=Prescription, 7=Complete
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'name' | 'code' | 'phone'>('name');
  
  // Selected data
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<Variety | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null);

  // Search customers
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    refetch: searchCustomers 
  } = useQuery({
    queryKey: ['customer-search', searchQuery, searchType],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 2) return [];
      const response = await apiService.get(`/customers/search?q=${encodeURIComponent(searchQuery.trim())}&type=${searchType}`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: false
  });

  // Get crops
  const { data: crops = [] } = useQuery({
    queryKey: ['crops'],
    queryFn: () => apiService.getCrops()
  });

  // Get varieties for selected crop
  const { data: varieties = [] } = useQuery({
    queryKey: ['varieties', selectedCrop?.id],
    queryFn: async () => {
      if (!selectedCrop) return [];
      const response = await apiService.get(`/varieties?crop_id=${selectedCrop.id}`);
      return response.data?.data || [];
    },
    enabled: !!selectedCrop
  });

  // Get symptoms for selected crop
  const { data: symptoms = [] } = useQuery({
    queryKey: ['symptoms', selectedCrop?.id],
    queryFn: async () => {
      if (!selectedCrop) return [];
      const response = await apiService.get(`/symptoms?crop_id=${selectedCrop.id}`);
      return response.data?.data || [];
    },
    enabled: !!selectedCrop
  });

  // Get diagnosis suggestions based on symptoms
  const { data: diagnosisSuggestions = [] } = useQuery({
    queryKey: ['diagnosis', selectedSymptoms],
    queryFn: async () => {
      if (selectedSymptoms.length === 0) return [];
      const response = await apiService.post('/diagnose', { symptomIds: selectedSymptoms });
      return response.data?.diagnoses || [];
    },
    enabled: selectedSymptoms.length > 0
  });

  // Get prescription recommendations
  const { data: recommendedProducts = [] } = useQuery({
    queryKey: ['prescriptions', selectedDiagnosis?.id],
    queryFn: async () => {
      if (!selectedDiagnosis) return [];
      const response = await apiService.get(`/prescriptions?diagnosis_id=${selectedDiagnosis.id}`);
      return response.data?.data || [];
    },
    enabled: !!selectedDiagnosis
  });

  // Create prescription
  const createPrescription = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiService.post('/prescriptions', data);
      return response.data;
    },
    onSuccess: (data) => {
      setPrescriptionId(data.id);
      setStep(7);
      toast({ title: '✓ Prescription Created', description: 'Prescription saved successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create prescription', variant: 'destructive' });
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim().length < 2) {
      toast({ title: 'Search Query Too Short', description: 'Please enter at least 2 characters', variant: 'destructive' });
      return;
    }
    searchCustomers();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep(2);
  };

  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setSelectedVariety(null);
    setSelectedSymptoms([]);
    setSelectedDiagnosis(null);
    setStep(3);
  };

  const handleSelectVariety = (variety: Variety) => {
    setSelectedVariety(variety);
    setStep(4);
  };

  const toggleSymptom = (symptomId: number) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setStep(6);
  };

  const handleSavePrescription = () => {
    if (!selectedCustomer || !selectedDiagnosis) {
      toast({ title: 'Missing Information', description: 'Customer and diagnosis are required', variant: 'destructive' });
      return;
    }

    createPrescription.mutate({
      customer_id: selectedCustomer.id,
      diagnosis_id: selectedDiagnosis.id,
      crop_id: selectedCrop?.id,
      variety_id: selectedVariety?.id,
      symptoms: selectedSymptoms,
      notes: prescriptionNotes,
      agent_id: user?.id
    });
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedCrop(null);
    setSelectedVariety(null);
    setSelectedSymptoms([]);
    setSelectedDiagnosis(null);
    setPrescriptionNotes('');
    setPrescriptionId(null);
    setSearchQuery('');
  };

  // Progress indicator
  const steps = [
    { num: 1, label: 'Customer', icon: User },
    { num: 2, label: 'Crop', icon: Sprout },
    { num: 3, label: 'Variety', icon: Dna },
    { num: 4, label: 'Symptoms', icon: Eye },
    { num: 5, label: 'Diagnosis', icon: Stethoscope },
    { num: 6, label: 'Prescription', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Progress Bar */}
      <div className="bg-card border-b px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${
                  step >= s.num ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {step > s.num ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Customer Search */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  {(['name', 'code', 'phone'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={searchType === type ? 'default' : 'outline'}
                      onClick={() => setSearchType(type)}
                      size="sm"
                      className="capitalize"
                    >
                      {type}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Input
                    placeholder={`Search by ${searchType}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-12"
                  />
                  <Button onClick={handleSearch} disabled={searchLoading} size="lg">
                    {searchLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  </Button>
                </div>

                {searchResults && searchResults.length > 0 && (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {searchResults.map((customer: Customer) => (
                      <Card 
                        key={customer.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold">{customer.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {customer.customer_code} • {customer.village}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Crop Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Select Crop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-bold">{selectedCustomer?.full_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {crops.map((crop: Crop) => (
                    <Card 
                      key={crop.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectCrop(crop)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Sprout className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="font-bold">{crop.name}</p>
                            {crop.name_local && (
                              <p className="text-sm text-muted-foreground">{crop.name_local}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Variety Selection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="h-5 w-5" />
                  Select Variety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-bold">{selectedCustomer?.full_name}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Crop</p>
                    <p className="font-bold">{selectedCrop?.name}</p>
                  </div>
                </div>

                {varieties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No varieties found for this crop</p>
                    <Button onClick={() => setStep(4)} className="mt-4">
                      Skip to Symptoms
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {varieties.map((variety: Variety) => (
                      <Card 
                        key={variety.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectVariety(variety)}
                      >
                        <CardContent className="p-4">
                          <p className="font-bold">{variety.variety_name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)}>Skip Variety</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Symptom Selection */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Select Symptoms ({selectedSymptoms.length} selected)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Crop</p>
                    <p className="font-bold">{selectedCrop?.name}</p>
                  </div>
                  {selectedVariety && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Variety</p>
                      <p className="font-bold">{selectedVariety.variety_name}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {symptoms.map((symptom: Symptom) => (
                    <div
                      key={symptom.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => toggleSymptom(symptom.id)}
                    >
                      <Checkbox
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => toggleSymptom(symptom.id)}
                      />
                      <div>
                        <p className="font-medium">{symptom.symptom_name}</p>
                        {symptom.symptom_name_local && (
                          <p className="text-sm text-muted-foreground">{symptom.symptom_name_local}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Affects: {Array.isArray(symptom.affected_part) ? symptom.affected_part.join(', ') : symptom.affected_part}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(5)} 
                    disabled={selectedSymptoms.length === 0}
                  >
                    Continue to Diagnosis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Diagnosis Selection */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Select Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Based on {selectedSymptoms.length} symptoms
                  </p>
                </div>

                {diagnosisSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No diagnosis suggestions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diagnosisSuggestions.map((diagnosis: Diagnosis) => (
                      <Card 
                        key={diagnosis.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectDiagnosis(diagnosis)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{diagnosis.diagnosis_name}</p>
                              {diagnosis.diagnosis_name_local && (
                                <p className="text-sm text-muted-foreground">{diagnosis.diagnosis_name_local}</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">{diagnosis.disease_type}</Badge>
                                <Badge variant={diagnosis.severity === 'Severe' ? 'destructive' : 'secondary'}>
                                  {diagnosis.severity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button variant="outline" onClick={() => setStep(4)} className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Prescription */}
          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate Prescription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-bold">{selectedCustomer?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Diagnosis</p>
                      <p className="font-bold">{selectedDiagnosis?.diagnosis_name}</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Recommended Products:</p>
                    {recommendedProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No specific product recommendations</p>
                    ) : (
                      <div className="space-y-2">
                        {recommendedProducts.map((product: any) => (
                          <div key={product.id} className="p-3 border rounded-lg">
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-sm text-muted-foreground">₹{product.selling_price}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Additional Notes</label>
                    <textarea
                      className="w-full mt-2 p-3 border rounded-lg"
                      rows={4}
                      placeholder="Enter treatment instructions, dosage, precautions..."
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(5)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      onClick={handleSavePrescription}
                      disabled={createPrescription.isPending}
                      className="flex-1"
                    >
                      {createPrescription.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Prescription'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 7: Complete */}
          {step === 7 && (
            <Card>
              <CardHeader className="text-center bg-primary/5">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl text-primary">Prescription Complete!</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Prescription ID</p>
                  <p className="text-2xl font-mono font-bold">{prescriptionId}</p>
                </div>

                <div className="bg-muted rounded-lg p-6 space-y-2">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{selectedCustomer?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diagnosis:</span>
                    <span className="font-medium">{selectedDiagnosis?.diagnosis_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crop:</span>
                    <span className="font-medium">{selectedCrop?.name}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                    Print Prescription
                  </Button>
                  <Button className="flex-1" onClick={handleReset}>
                    New Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
export interface Crop {
  id: string;
  name: string;
  local_name?: string;
  scientific_name?: string;
  category: 'Cereal' | 'Pulse' | 'Vegetable' | 'Fruit' | 'Fiber' | 'Oilseed';
  growing_season: 'Kharif' | 'Rabi' | 'Zaid' | 'All Year';
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface CropVariety {
  id: string;
  crop_id: string;
  name: string;
  local_name?: string;
  description?: string;
  created_at: string;
}

export interface Symptom {
  id: string;
  crop_id: string;
  name: string;
  local_name?: string;
  description?: string;
  affected_part: string[];
  visual_indicators: string[];
  crop_stage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  image_url?: string;
  created_at: string;
}

export interface Diagnosis {
  id: string;
  name: string;
  local_name?: string;
  disease_type: 'Fungal' | 'Bacterial' | 'Viral' | 'Pest' | 'Deficiency';
  causative_agent?: string;
  description?: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  spread_rate: 'Slow' | 'Medium' | 'Fast';
  favorable_conditions?: string;
  prevention_tips?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  local_name?: string;
  manufacturer?: string;
  active_ingredient?: string;
  product_type: 'Fungicide' | 'Insecticide' | 'Fertilizer' | 'Herbicide' | 'Bio-agent';
  formulation?: string;
  pack_sizes?: string;
  price_range?: string;
  registration_number?: string;
  safety_rating: 'Green' | 'Yellow' | 'Red';
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface SymptomDiagnosisMapping {
  id: string;
  symptom_id: string;
  diagnosis_id: string;
  confidence: number;
  created_at: string;
}

export interface Prescription {
  id: string;
  diagnosis_id: string;
  product_id: string;
  dosage_per_litre?: string;
  dosage_per_acre?: string;
  dosage_per_bigha?: string;
  application_method: 'Spray' | 'Drench' | 'Broadcast' | 'Seed Treatment';
  application_timing?: string;
  frequency: 'Once' | 'Weekly' | 'Fortnightly' | 'Monthly';
  num_applications?: number;
  precautions?: string;
  compatibility_notes?: string;
  waiting_period_days?: number;
  instructions?: string;
  priority: number;
  created_at: string;
}

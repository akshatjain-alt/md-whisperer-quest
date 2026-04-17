// Backend-aligned entity types (numeric ids, snake_case fields).
// These match the Express + Postgres API the project consumes.

export interface Crop {
  id: number;
  name: string;
  local_name?: string;
  scientific_name?: string;
  category?: string;
  growing_season?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface CropVariety {
  id: number;
  crop_id: number;
  variety_name: string;
  variety_name_local?: string;
  maturity_days?: number;
  yield_per_acre?: string;
  characteristics?: string;
  description?: string;
  created_at?: string;
}

export interface Symptom {
  id: number;
  crop_id?: number;
  symptom_name: string;
  symptom_name_local?: string;
  description?: string;
  affected_part?: string;
  visual_indicators?: string;
  stage_of_crop?: string;
  severity_level?: string;
  symptom_type?: string;
  image_url?: string;
  created_at?: string;
}

export interface Diagnosis {
  id: number;
  diagnosis_name: string;
  diagnosis_name_local?: string;
  disease_type?: string;
  causative_agent?: string;
  description?: string;
  severity?: string;
  spread_rate?: string;
  favorable_conditions?: string;
  prevention_tips?: string;
  image_url?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  product_name: string;
  product_name_local?: string;
  product_category?: string;
  manufacturer?: string;
  active_ingredient?: string;
  formulation?: string;
  pack_sizes?: string;
  price_range?: string;
  registration_number?: string;
  safety_rating?: string;
  description?: string;
  image_url?: string;
  selling_price?: number;
  cost_price?: number;
  mrp?: number;
  stock_quantity?: number;
  created_at?: string;
}

export interface SymptomDiagnosisMapping {
  id: number;
  symptom_id: number;
  diagnosis_id: number;
  confidence?: number;
  created_at?: string;
}

export interface Prescription {
  id: number;
  diagnosis_id: number;
  product_id: number;
  dosage_per_litre?: string;
  dosage_per_acre?: string;
  dosage_per_bigha?: string;
  application_method?: string;
  application_timing?: string;
  frequency?: string;
  num_applications?: number;
  precautions?: string;
  compatibility_notes?: string;
  waiting_period_days?: number;
  instructions?: string;
  priority?: number;
  created_at?: string;
}

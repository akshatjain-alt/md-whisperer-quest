import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Crop, Symptom, Diagnosis, Product, SymptomDiagnosisMapping, Prescription } from '@/types';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

interface AppStore {
  crops: Crop[];
  symptoms: Symptom[];
  diagnoses: Diagnosis[];
  products: Product[];
  mappings: SymptomDiagnosisMapping[];
  prescriptions: Prescription[];

  addCrop: (c: Omit<Crop, 'id' | 'created_at'>) => void;
  updateCrop: (id: string, c: Partial<Crop>) => void;
  deleteCrop: (id: string) => void;

  addSymptom: (s: Omit<Symptom, 'id' | 'created_at'>) => void;
  updateSymptom: (id: string, s: Partial<Symptom>) => void;
  deleteSymptom: (id: string) => void;

  addDiagnosis: (d: Omit<Diagnosis, 'id' | 'created_at'>) => void;
  updateDiagnosis: (id: string, d: Partial<Diagnosis>) => void;
  deleteDiagnosis: (id: string) => void;

  addProduct: (p: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addMapping: (m: Omit<SymptomDiagnosisMapping, 'id' | 'created_at'>) => void;
  deleteMapping: (id: string) => void;

  addPrescription: (p: Omit<Prescription, 'id' | 'created_at'>) => void;
  updatePrescription: (id: string, p: Partial<Prescription>) => void;
  deletePrescription: (id: string) => void;
}

const MOCK_CROPS: Crop[] = [
  { id: uid(), name: 'Wheat', local_name: 'गेहूं', scientific_name: 'Triticum aestivum', category: 'Cereal', growing_season: 'Rabi', description: 'Major cereal crop grown in winter season', created_at: now() },
  { id: uid(), name: 'Cotton', local_name: 'कपास', scientific_name: 'Gossypium', category: 'Fiber', growing_season: 'Kharif', description: 'Major fiber crop', created_at: now() },
  { id: uid(), name: 'Rice', local_name: 'धान', scientific_name: 'Oryza sativa', category: 'Cereal', growing_season: 'Kharif', description: 'Staple food crop', created_at: now() },
  { id: uid(), name: 'Maize', local_name: 'मक्का', scientific_name: 'Zea mays', category: 'Cereal', growing_season: 'All Year', description: 'Versatile cereal crop', created_at: now() },
];

const MOCK_SYMPTOMS: Symptom[] = [
  { id: uid(), crop_id: '', name: 'Yellow stripes on leaves', local_name: 'पत्तियों पर पीली धारियां', affected_part: ['Leaf'], visual_indicators: ['yellow spots', 'striping'], crop_stage: 'Vegetative', severity: 'High', created_at: now() },
  { id: uid(), crop_id: '', name: 'Brown spots on stems', local_name: 'तनों पर भूरे धब्बे', affected_part: ['Stem'], visual_indicators: ['brown spots', 'lesions'], crop_stage: 'Flowering', severity: 'Medium', created_at: now() },
  { id: uid(), crop_id: '', name: 'Wilting of plants', local_name: 'पौधों का मुरझाना', affected_part: ['Leaf', 'Stem'], visual_indicators: ['drooping', 'wilting'], crop_stage: 'Vegetative', severity: 'Critical', created_at: now() },
];

const MOCK_DIAGNOSES: Diagnosis[] = [
  { id: uid(), name: 'Yellow Rust', local_name: 'पीला रतुआ', disease_type: 'Fungal', causative_agent: 'Puccinia striiformis', severity: 'Severe', spread_rate: 'Fast', description: 'Fungal disease causing yellow pustules on wheat', created_at: now() },
  { id: uid(), name: 'Pink Bollworm', local_name: 'गुलाबी सुंडी', disease_type: 'Pest', causative_agent: 'Pectinophora gossypiella', severity: 'Severe', spread_rate: 'Medium', description: 'Major pest of cotton', created_at: now() },
  { id: uid(), name: 'Nitrogen Deficiency', local_name: 'नाइट्रोजन की कमी', disease_type: 'Deficiency', severity: 'Moderate', spread_rate: 'Slow', description: 'Nutrient deficiency causing yellowing', created_at: now() },
];

const MOCK_PRODUCTS: Product[] = [
  { id: uid(), name: 'Mancozeb 75% WP', manufacturer: 'Indofil', active_ingredient: 'Mancozeb', product_type: 'Fungicide', formulation: 'WP', safety_rating: 'Yellow', created_at: now() },
  { id: uid(), name: 'Imidacloprid 17.8% SL', manufacturer: 'Bayer', active_ingredient: 'Imidacloprid', product_type: 'Insecticide', formulation: 'SL', safety_rating: 'Red', created_at: now() },
  { id: uid(), name: 'Propiconazole 25% EC', manufacturer: 'Syngenta', active_ingredient: 'Propiconazole', product_type: 'Fungicide', formulation: 'EC', safety_rating: 'Yellow', created_at: now() },
];

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      crops: MOCK_CROPS,
      symptoms: MOCK_SYMPTOMS,
      diagnoses: MOCK_DIAGNOSES,
      products: MOCK_PRODUCTS,
      mappings: [],
      prescriptions: [],

      addCrop: (c) => set((s) => ({ crops: [...s.crops, { ...c, id: uid(), created_at: now() }] })),
      updateCrop: (id, c) => set((s) => ({ crops: s.crops.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteCrop: (id) => set((s) => ({ crops: s.crops.filter((x) => x.id !== id) })),

      addSymptom: (sym) => set((s) => ({ symptoms: [...s.symptoms, { ...sym, id: uid(), created_at: now() }] })),
      updateSymptom: (id, sym) => set((s) => ({ symptoms: s.symptoms.map((x) => (x.id === id ? { ...x, ...sym } : x)) })),
      deleteSymptom: (id) => set((s) => ({ symptoms: s.symptoms.filter((x) => x.id !== id) })),

      addDiagnosis: (d) => set((s) => ({ diagnoses: [...s.diagnoses, { ...d, id: uid(), created_at: now() }] })),
      updateDiagnosis: (id, d) => set((s) => ({ diagnoses: s.diagnoses.map((x) => (x.id === id ? { ...x, ...d } : x)) })),
      deleteDiagnosis: (id) => set((s) => ({ diagnoses: s.diagnoses.filter((x) => x.id !== id) })),

      addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid(), created_at: now() }] })),
      updateProduct: (id, p) => set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      addMapping: (m) => set((s) => ({ mappings: [...s.mappings, { ...m, id: uid(), created_at: now() }] })),
      deleteMapping: (id) => set((s) => ({ mappings: s.mappings.filter((x) => x.id !== id) })),

      addPrescription: (p) => set((s) => ({ prescriptions: [...s.prescriptions, { ...p, id: uid(), created_at: now() }] })),
      updatePrescription: (id, p) => set((s) => ({ prescriptions: s.prescriptions.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deletePrescription: (id) => set((s) => ({ prescriptions: s.prescriptions.filter((x) => x.id !== id) })),
    }),
    { name: 'crop-clinic-store' }
  )
);

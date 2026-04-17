import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search as SearchIcon, Sprout, Search as SymptomIcon, Stethoscope, Pill, FileText, Link2 } from 'lucide-react';

interface SearchResult {
  type: 'crop' | 'symptom' | 'diagnosis' | 'product' | 'prescription' | 'mapping';
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  data: any;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  // Fetch all data
  const { data: crops = [] } = useQuery({ queryKey: ['crops'], queryFn: () => apiService.getCrops() });
  const { data: symptoms = [] } = useQuery({ queryKey: ['symptoms'], queryFn: () => apiService.getSymptoms() });
  const { data: diagnoses = [] } = useQuery({ queryKey: ['diagnoses'], queryFn: () => apiService.getAll('diagnoses') });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: () => apiService.getAll('products') });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search crops
    crops.forEach((crop: any) => {
      if (
        crop.name?.toLowerCase().includes(lowerQuery) ||
        crop.local_name?.toLowerCase().includes(lowerQuery) ||
        crop.scientific_name?.toLowerCase().includes(lowerQuery) ||
        crop.category?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'crop',
          id: crop.id,
          title: crop.name,
          subtitle: crop.local_name,
          description: crop.description || crop.category,
          data: crop,
        });
      }
    });

    // Search symptoms
    symptoms.forEach((symptom: any) => {
      if (
        symptom.symptom_name?.toLowerCase().includes(lowerQuery) ||
        symptom.symptom_name_local?.toLowerCase().includes(lowerQuery) ||
        symptom.description?.toLowerCase().includes(lowerQuery) ||
        symptom.affected_part?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'symptom',
          id: symptom.id,
          title: symptom.symptom_name,
          subtitle: symptom.symptom_name_local,
          description: symptom.description || `Affects: ${symptom.affected_part}`,
          data: symptom,
        });
      }
    });

    // Search diagnoses
    diagnoses.forEach((diagnosis: any) => {
      if (
        diagnosis.diagnosis_name?.toLowerCase().includes(lowerQuery) ||
        diagnosis.diagnosis_name_local?.toLowerCase().includes(lowerQuery) ||
        diagnosis.disease_type?.toLowerCase().includes(lowerQuery) ||
        diagnosis.causative_agent?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'diagnosis',
          id: diagnosis.id,
          title: diagnosis.diagnosis_name,
          subtitle: diagnosis.diagnosis_name_local,
          description: `${diagnosis.disease_type || ''} - ${diagnosis.causative_agent || ''}`,
          data: diagnosis,
        });
      }
    });

    // Search products
    products.forEach((product: any) => {
      if (
        product.product_name?.toLowerCase().includes(lowerQuery) ||
        product.product_name_local?.toLowerCase().includes(lowerQuery) ||
        product.active_ingredient?.toLowerCase().includes(lowerQuery) ||
        product.manufacturer?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          type: 'product',
          id: product.id,
          title: product.product_name,
          subtitle: product.product_name_local,
          description: product.active_ingredient || product.manufacturer,
          data: product,
        });
      }
    });

    setResults(searchResults);
    setIsSearching(false);
  }, [query, crops, symptoms, diagnoses, products]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'crop': return <Sprout className="h-5 w-5" />;
      case 'symptom': return <SymptomIcon className="h-5 w-5" />;
      case 'diagnosis': return <Stethoscope className="h-5 w-5" />;
      case 'product': return <Pill className="h-5 w-5" />;
      case 'prescription': return <FileText className="h-5 w-5" />;
      case 'mapping': return <Link2 className="h-5 w-5" />;
      default: return <SearchIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'crop': return 'bg-green-100 text-green-700';
      case 'symptom': return 'bg-yellow-100 text-yellow-700';
      case 'diagnosis': return 'bg-red-100 text-red-700';
      case 'product': return 'bg-blue-100 text-blue-700';
      case 'prescription': return 'bg-purple-100 text-purple-700';
      case 'mapping': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const navigateToItem = (result: SearchResult) => {
    const routes = {
      crop: '/crops',
      symptom: '/symptoms',
      diagnosis: '/diagnoses',
      product: '/products',
      prescription: '/prescriptions',
      mapping: '/mappings',
    };
    navigate(routes[result.type]);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SearchIcon className="h-6 w-6" />
          Search Results
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {query ? `Showing results for "${query}"` : 'Enter a search query to begin'}
        </p>
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Searching...</span>
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              {query ? `No results found for "${query}". Try a different search term.` : 'Start typing to search across all data.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </p>

          {results.map((result, index) => (
            <Card key={`${result.type}-${result.id}-${index}`} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigateToItem(result)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getIcon(result.type)}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      {result.subtitle && (
                        <CardDescription className="mt-1">{result.subtitle}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getTypeColor(result.type)}`}>
                    {result.type.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              {result.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
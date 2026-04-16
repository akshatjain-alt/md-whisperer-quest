import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CropsPage from "@/pages/CropsPage";
import VarietiesPage from "@/pages/VarietiesPage";
import SymptomsPage from "@/pages/SymptomsPage";
import DiagnosesPage from "@/pages/DiagnosesPage";
import ProductsPage from "@/pages/ProductsPage";
import MappingsPage from "@/pages/MappingsPage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crops" element={<CropsPage />} />
            <Route path="/varieties" element={<VarietiesPage />} />
            <Route path="/symptoms" element={<SymptomsPage />} />
            <Route path="/diagnoses" element={<DiagnosesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/mappings" element={<MappingsPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CropsPage from "@/pages/CropsPage";
import VarietiesPage from "@/pages/VarietiesPage";
import SymptomsPage from "@/pages/SymptomsPage";
import DiagnosesPage from "@/pages/DiagnosesPage";
import ProductsPage from "@/pages/ProductsPage";
import MappingsPage from "@/pages/MappingsPage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import UserManagement from "@/pages/UserManagement";
import AgentPrescription from "@/pages/AgentPrescription";
import AgentHistory from "@/pages/AgentHistory";
import ProductAnalysis from "@/pages/admin/ProductAnalysis";
import FinancialReports from "@/pages/admin/FinancialReports";
import TransactionAnalytics from "@/pages/admin/TransactionAnalytics";
import ShopComparison from "@/pages/admin/ShopComparison";
import ShopManagement from "@/pages/admin/ShopManagement";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/prescription" element={<AgentPrescription />} />
                      <Route path="/history" element={<AgentHistory />} />
                      <Route path="/admin/products" element={<ProductAnalysis />} />
                      <Route path="/admin/reports" element={<FinancialReports />} />
                      <Route path="/admin/transactions" element={<TransactionAnalytics />} />
                      <Route path="/admin/shops" element={<ShopComparison />} />
                      <Route path="/admin/management" element={<ShopManagement />} />
                      <Route path="/crops" element={<CropsPage />} />
                      <Route path="/varieties" element={<VarietiesPage />} />
                      <Route path="/symptoms" element={<SymptomsPage />} />
                      <Route path="/diagnoses" element={<DiagnosesPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/mappings" element={<MappingsPage />} />
                      <Route path="/prescriptions" element={<PrescriptionsPage />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
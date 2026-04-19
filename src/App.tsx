import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Shared
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Search from "@/pages/Search";
import NotFound from "@/pages/NotFound";

// Admin
import AdminDashboardNew from "@/pages/AdminDashboardNew";
import ProductAnalysis from "@/pages/admin/ProductAnalysis";
import FinancialReports from "@/pages/admin/FinancialReports";
import TransactionAnalytics from "@/pages/admin/TransactionAnalytics";
import ShopComparison from "@/pages/admin/ShopComparison";
import ShopManagement from "@/pages/admin/ShopManagement";
import UserManagement from "@/pages/UserManagement";

// Manager
import ManagerDashboard from "@/pages/ManagerDashboard";
import { ManagerAgents, ManagerInventory, ManagerTargets } from "@/pages/manager/ManagerPages";

// Agent
import AgentDashboard from "@/pages/AgentDashboard";
import AgentPrescription from "@/pages/AgentPrescription";
import AgentHistory from "@/pages/AgentHistory";
import PrescriptionPrint from "@/pages/PrescriptionPrint";

// Expert
import ExpertDashboardNew from "@/pages/expert/ExpertDashboardNew";
import CropsPage from "@/pages/CropsPage";
import VarietiesPage from "@/pages/VarietiesPage";
import SymptomsPage from "@/pages/SymptomsPage";
import DiagnosesPage from "@/pages/DiagnosesPage";
import ProductsPage from "@/pages/ProductsPage";
import MappingsPage from "@/pages/MappingsPage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";

// Viewer (wiki)
import ViewerBrowse from "@/pages/viewer/ViewerBrowse";
import ViewerCrops from "@/pages/viewer/ViewerCrops";
import ViewerCropArticle from "@/pages/viewer/ViewerCropArticle";
import ViewerDiseases from "@/pages/viewer/ViewerDiseases";
import ViewerDiseaseArticle from "@/pages/viewer/ViewerDiseaseArticle";
import ViewerProducts from "@/pages/viewer/ViewerProducts";
import ViewerProductArticle from "@/pages/viewer/ViewerProductArticle";
import ViewerSearch from "@/pages/viewer/ViewerSearch";

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
                      {/* Role-based root redirect */}
                      <Route path="/" element={<Dashboard />} />

                      {/* Admin */}
                      <Route path="/admin/dashboard" element={<AdminDashboardNew />} />
                      <Route path="/admin/products" element={<ProductAnalysis />} />
                      <Route path="/admin/reports" element={<FinancialReports />} />
                      <Route path="/admin/transactions" element={<TransactionAnalytics />} />
                      <Route path="/admin/shops" element={<ShopComparison />} />
                      <Route path="/admin/management" element={<ShopManagement />} />
                      <Route path="/admin/users" element={<UserManagement />} />

                      {/* Manager */}
                      <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                      <Route path="/manager/agents" element={<ManagerAgents />} />
                      <Route path="/manager/inventory" element={<ManagerInventory />} />
                      <Route path="/manager/targets" element={<ManagerTargets />} />

                      {/* Agent */}
                      <Route path="/agent/dashboard" element={<AgentDashboard />} />
                      <Route path="/agent/prescription" element={<AgentPrescription />} />
                      <Route path="/agent/prescription/:id/print" element={<PrescriptionPrint />} />
                      <Route path="/agent/history" element={<AgentHistory />} />

                      {/* Expert */}
                      <Route path="/expert/dashboard" element={<ExpertDashboardNew />} />
                      <Route path="/expert/crops" element={<CropsPage />} />
                      <Route path="/expert/varieties" element={<VarietiesPage />} />
                      <Route path="/expert/symptoms" element={<SymptomsPage />} />
                      <Route path="/expert/diagnoses" element={<DiagnosesPage />} />
                      <Route path="/expert/products" element={<ProductsPage />} />
                      <Route path="/expert/mappings" element={<MappingsPage />} />
                      <Route path="/expert/prescriptions" element={<PrescriptionsPage />} />

                      {/* Viewer (Wikipedia-style) */}
                      <Route path="/viewer/browse" element={<ViewerBrowse />} />
                      <Route path="/viewer/crops" element={<ViewerCrops />} />
                      <Route path="/viewer/crops/:id" element={<ViewerCropArticle />} />
                      <Route path="/viewer/diseases" element={<ViewerDiseases />} />
                      <Route path="/viewer/diseases/:id" element={<ViewerDiseaseArticle />} />
                      <Route path="/viewer/products" element={<ViewerProducts />} />
                      <Route path="/viewer/products/:id" element={<ViewerProductArticle />} />
                      <Route path="/viewer/search" element={<ViewerSearch />} />

                      {/* Shared */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/search" element={<Search />} />

                      {/* Legacy redirects (old flat routes → new nested) */}
                      <Route path="/prescription" element={<Navigate to="/agent/prescription" replace />} />
                      <Route path="/history" element={<Navigate to="/agent/history" replace />} />
                      <Route path="/crops" element={<Navigate to="/expert/crops" replace />} />
                      <Route path="/varieties" element={<Navigate to="/expert/varieties" replace />} />
                      <Route path="/symptoms" element={<Navigate to="/expert/symptoms" replace />} />
                      <Route path="/diagnoses" element={<Navigate to="/expert/diagnoses" replace />} />
                      <Route path="/products" element={<Navigate to="/expert/products" replace />} />
                      <Route path="/mappings" element={<Navigate to="/expert/mappings" replace />} />
                      <Route path="/prescriptions" element={<Navigate to="/expert/prescriptions" replace />} />
                      <Route path="/users" element={<Navigate to="/admin/users" replace />} />

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

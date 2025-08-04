import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute"; // Import AdminProtectedRoute
import AdminDashboard from "./pages/AdminDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout"; // Import the Layout component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes wrapped by Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}> {/* Apply Layout here */}
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<UserProfilePage />} />
                {/* Admin Protected Route */}
                <Route path="/admin" element={<AdminProtectedRoute />}>
                  <Route index element={<AdminDashboard />} />
                </Route>
                {/* ADD ALL CUSTOM PROTECTED ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
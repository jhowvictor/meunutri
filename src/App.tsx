
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReceitaPersonalizada from "./pages/ReceitaPersonalizada";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ApiKeyConfig from "./components/ApiKeyConfig";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import MiniChef from "./components/MiniChef";
import { LanguageProvider } from "./hooks/use-language";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ApiKeyConfig />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Index />
                  </>
                </ProtectedRoute>
              } />
              <Route path="/receita-personalizada" element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <ReceitaPersonalizada />
                  </>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniChef />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

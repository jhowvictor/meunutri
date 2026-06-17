
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReceitaPersonalizada from "./pages/ReceitaPersonalizada";
import AnalisarRefeicao from "./pages/AnalisarRefeicao";
import DietaPersonalizada from "./pages/DietaPersonalizada";
import EbookPersonalizado from "./pages/EbookPersonalizado";
import EvolucaoCorporal from "./pages/EvolucaoCorporal";
import ListaCompras from "./pages/ListaCompras";
import MontarTreino from "./pages/MontarTreino";
import MinhaBiblioteca from "./pages/MinhaBiblioteca";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ApiKeyConfig from "./components/ApiKeyConfig";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import MiniChef from "./components/MiniChef";
// Removed LanguageProvider import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ApiKeyConfig />
      <BrowserRouter>
        <AuthProvider>
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
            <Route path="/analisar-refeicao" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <AnalisarRefeicao />
                </>
              </ProtectedRoute>
            } />
            <Route path="/dieta-personalizada" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <DietaPersonalizada />
                </>
              </ProtectedRoute>
            } />
            <Route path="/ebook-personalizado" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <EbookPersonalizado />
                </>
              </ProtectedRoute>
            } />
            <Route path="/evolucao-corporal" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <EvolucaoCorporal />
                </>
              </ProtectedRoute>
            } />
            <Route path="/lista-compras" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <ListaCompras />
                </>
              </ProtectedRoute>
            } />
            <Route path="/montar-treino" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <MontarTreino />
                </>
              </ProtectedRoute>
            } />
            <Route path="/minha-biblioteca" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <MinhaBiblioteca />
                </>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MiniChef />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

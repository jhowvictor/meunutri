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
import Perfil from "./pages/Perfil";
import Favoritos from "./pages/Favoritos";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ApiKeyConfig from "./components/ApiKeyConfig";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

const queryClient = new QueryClient();

const protect = (node: React.ReactNode) => (
  <ProtectedRoute>
    <AppShell>{node}</AppShell>
  </ProtectedRoute>
);

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
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={protect(<Index />)} />
            <Route path="/receita-personalizada" element={protect(<ReceitaPersonalizada />)} />
            <Route path="/analisar-refeicao" element={protect(<AnalisarRefeicao />)} />
            <Route path="/dieta-personalizada" element={protect(<DietaPersonalizada />)} />
            <Route path="/ebook-personalizado" element={protect(<EbookPersonalizado />)} />
            <Route path="/evolucao-corporal" element={protect(<EvolucaoCorporal />)} />
            <Route path="/lista-compras" element={protect(<ListaCompras />)} />
            <Route path="/montar-treino" element={protect(<MontarTreino />)} />
            <Route path="/minha-biblioteca" element={protect(<MinhaBiblioteca />)} />
            <Route path="/perfil" element={protect(<Perfil />)} />
            <Route path="/favoritos" element={protect(<Favoritos />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

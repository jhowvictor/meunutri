import { Link } from "react-router-dom";
import { ArrowLeft, Utensils, Dumbbell, ChefHat, ClipboardList } from "lucide-react";

const items = [
  { to: "/dieta-personalizada", label: "Criar Dieta", desc: "Plano alimentar baseado em objetivo", icon: Utensils },
  { to: "/montar-treino", label: "Criar Treino", desc: "Treino por nível e objetivo", icon: Dumbbell },
  { to: "/receita-personalizada", label: "Criar Receita", desc: "Restrições e preferências", icon: ChefHat },
  { to: "/ebook-personalizado", label: "Plano Inicial / E-book", desc: "Material de acompanhamento", icon: ClipboardList },
];

const Criacao = () => (
  <div className="space-y-4 pb-4">
    <header className="flex items-center gap-3 pt-2">
      <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
      <h1 className="text-xl font-extrabold">Motor de Criação</h1>
    </header>
    <p className="text-xs text-muted-foreground">
      Gere conteúdos iniciais como sugestões. Você revisa e edita antes de enviar ao paciente.
    </p>
    <div className="grid grid-cols-2 gap-3">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-primary/40">
          <i.icon className="h-5 w-5 text-primary mb-2" />
          <div className="font-bold text-sm">{i.label}</div>
          <div className="text-[11px] text-muted-foreground">{i.desc}</div>
        </Link>
      ))}
    </div>
  </div>
);

export default Criacao;

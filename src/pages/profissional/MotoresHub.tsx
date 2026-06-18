import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, RefreshCw, Send, BarChart3, FileBarChart, BookOpen } from "lucide-react";

const motores = [
  { to: "/profissional/motores/criacao", label: "Motor de Criação", desc: "Prescrição assistida: dietas, treinos e receitas iniciais.", icon: Sparkles, color: "text-emerald-400" },
  { to: "/profissional/motores/adaptacao", label: "Motor de Adaptação", desc: "Ajustes inteligentes sobre planos já enviados.", icon: RefreshCw, color: "text-sky-400" },
  { to: "/profissional/motores/comunicacao", label: "Motor de Comunicação", desc: "Envie planos e mensagens com sua identidade.", icon: Send, color: "text-violet-400" },
  { to: "/profissional/motores/acompanhamento", label: "Motor de Acompanhamento", desc: "Status, adesão e alertas de abandono.", icon: BarChart3, color: "text-amber-400" },
  { to: "/profissional/motores/relatorios", label: "Motor de Relatórios", desc: "Relatórios semanais, mensais e de adesão.", icon: FileBarChart, color: "text-rose-400" },
  { to: "/profissional/motores/conteudo", label: "Motor de Conteúdo", desc: "Mensagens prontas para pacientes.", icon: BookOpen, color: "text-teal-400" },
];

const MotoresHub = () => (
  <div className="space-y-4 pb-4">
    <header className="flex items-center gap-3 pt-2">
      <Link to="/profissional" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
      <div>
        <h1 className="text-2xl font-extrabold leading-tight">Motores</h1>
        <p className="text-xs text-muted-foreground">Plataforma operacional do profissional</p>
      </div>
    </header>
    <div className="grid grid-cols-1 gap-3">
      {motores.map((m) => (
        <Link
          key={m.to}
          to={m.to}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-primary/40 transition flex gap-3"
        >
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <m.icon className={`h-5 w-5 ${m.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">{m.label}</div>
            <div className="text-[11px] text-muted-foreground leading-snug">{m.desc}</div>
          </div>
        </Link>
      ))}
    </div>
    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3 text-[11px] text-amber-200/80">
      Os motores atuam como assistentes. Toda saída é uma sugestão editável — nunca substituem sua decisão clínica.
    </div>
  </div>
);

export default MotoresHub;

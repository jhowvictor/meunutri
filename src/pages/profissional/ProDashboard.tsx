import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, Activity, ClipboardList, ArrowRight, Stethoscope, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  full_name: string;
  goal: string | null;
  adherence_status: string | null;
  last_activity_at: string | null;
}

const ProDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({ total: 0, green: 0, yellow: 0, red: 0, assignments: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: pats } = await (supabase as any)
        .from("patients")
        .select("id, full_name, goal, adherence_status, last_activity_at")
        .eq("professional_id", user.id)
        .order("last_activity_at", { ascending: false, nullsFirst: false })
        .limit(8);
      const list = (pats as Patient[]) || [];
      setPatients(list);

      const { count: total } = await (supabase as any)
        .from("patients").select("*", { count: "exact", head: true }).eq("professional_id", user.id);
      const { count: assigns } = await (supabase as any)
        .from("patient_assignments").select("*", { count: "exact", head: true }).eq("professional_id", user.id);

      const counts = { green: 0, yellow: 0, red: 0 };
      list.forEach((p) => {
        const s = (p.adherence_status || "green") as keyof typeof counts;
        if (counts[s] !== undefined) counts[s]++;
      });
      setStats({ total: total ?? 0, ...counts, assignments: assigns ?? 0 });
    })();
  }, [user]);

  return (
    <div className="space-y-5 pb-4">
      <header className="pt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-2">
          <Stethoscope className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase text-primary">Painel Profissional</span>
        </div>
        <h1 className="text-3xl font-extrabold leading-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe a jornada dos seus pacientes em um só lugar</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Pacientes ativos" value={stats.total} icon={Users} accent="text-primary" />
        <StatCard label="Planos enviados" value={stats.assignments} icon={ClipboardList} accent="text-emerald-400" />
        <StatCard label="Evoluindo bem" value={stats.green} icon={Activity} accent="text-emerald-400" />
        <StatCard label="Sem progresso" value={stats.red} icon={Activity} accent="text-rose-400" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Meus Pacientes</h2>
          <Link to="/profissional/pacientes" className="text-xs text-primary font-semibold flex items-center gap-1">
            Ver todos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {patients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Nenhum paciente ainda</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Adicione seu primeiro paciente para começar</p>
            <Link to="/profissional/pacientes/novo">
              <Button size="sm" className="rounded-full bg-primary"><Plus className="h-4 w-4 mr-1" /> Adicionar paciente</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map((p) => <PatientRow key={p.id} p={p} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2">Ferramentas profissionais</h2>
        <div className="grid grid-cols-2 gap-3">
          <ToolCard to="/receita-personalizada" label="Receitas" desc="Gerar e enviar" icon={FileText} />
          <ToolCard to="/dieta-personalizada" label="Dietas" desc="Planos completos" icon={ClipboardList} />
          <ToolCard to="/montar-treino" label="Treinos" desc="Banco e templates" icon={Activity} />
          <ToolCard to="/profissional/pacientes" label="Pacientes" desc="Painel completo" icon={Users} />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <Icon className={`h-5 w-5 ${accent} mb-2`} />
    <div className="text-2xl font-extrabold">{value}</div>
    <div className="text-[11px] text-muted-foreground">{label}</div>
  </div>
);

const dotColor: Record<string, string> = { green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-rose-400" };

const PatientRow = ({ p }: { p: Patient }) => (
  <Link to={`/profissional/paciente/${p.id}`} className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 transition">
    <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary">
      {p.full_name.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold truncate">{p.full_name}</div>
      <div className="text-[11px] text-muted-foreground truncate">{p.goal || "Sem objetivo definido"}</div>
    </div>
    <span className={`h-2.5 w-2.5 rounded-full ${dotColor[p.adherence_status || "green"]}`} />
    <ArrowRight className="h-4 w-4 text-muted-foreground" />
  </Link>
);

const ToolCard = ({ to, label, desc, icon: Icon }: { to: string; label: string; desc: string; icon: any }) => (
  <Link to={to} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-primary/40 transition">
    <Icon className="h-5 w-5 text-primary mb-2" />
    <div className="font-bold text-sm">{label}</div>
    <div className="text-[11px] text-muted-foreground">{desc}</div>
  </Link>
);

export default ProDashboard;

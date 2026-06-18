import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Target, FileText, Activity, Utensils, Camera, Droplet, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import PacienteGlicemiaPanel from "@/components/PacienteGlicemiaPanel";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  goal: string | null;
  notes: string | null;
  adherence_status: string;
  invite_status: string;
}

interface Assignment {
  id: string;
  assignment_type: string;
  title: string;
  status: string;
  created_at: string;
}

const adhLabel: Record<string, string> = { green: "🟢 Evoluindo bem", yellow: "🟡 Oscilando", red: "🔴 Sem progresso" };
const typeLabel: Record<string, string> = { receita: "Receita", dieta: "Dieta", treino: "Treino", lista: "Lista", ebook: "E-book", outro: "Outro" };

const PacienteDetalhe = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data } = await (supabase as any).from("patients").select("*").eq("id", id).maybeSingle();
      setPatient(data);
      const { data: ass } = await (supabase as any)
        .from("patient_assignments")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });
      setAssignments((ass as Assignment[]) || []);
    })();
  }, [id, user]);

  const updateAdherence = async (val: string) => {
    if (!patient) return;
    const { error } = await (supabase as any).from("patients").update({ adherence_status: val }).eq("id", patient.id);
    if (error) return toast.error(error.message);
    setPatient({ ...patient, adherence_status: val });
    toast.success("Status atualizado");
  };

  if (!patient) return <div className="py-10 text-center text-muted-foreground">Carregando...</div>;

  const filterAss = (t: string) => assignments.filter((a) => a.assignment_type === t);

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3">
        <Link to="/profissional/pacientes" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold flex-1 truncate">{patient.full_name}</h1>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-lg">
            {patient.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold">{patient.full_name}</div>
            <div className="text-[11px] text-muted-foreground">
              {patient.invite_status === "accepted" ? "Conta vinculada" : "Aguardando convite"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {patient.email && <Info icon={Mail}>{patient.email}</Info>}
          {patient.phone && <Info icon={Phone}>{patient.phone}</Info>}
          {patient.city && <Info icon={MapPin}>{patient.city}</Info>}
          {patient.goal && <Info icon={Target}>{patient.goal}</Info>}
        </div>

        <div className="pt-2 border-t border-white/10">
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Aderência</label>
          <Select value={patient.adherence_status} onValueChange={updateAdherence}>
            <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="green">🟢 Evoluindo bem</SelectItem>
              <SelectItem value="yellow">🟡 Oscilando</SelectItem>
              <SelectItem value="red">🔴 Sem progresso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="dietas">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dietas">Dietas</TabsTrigger>
          <TabsTrigger value="treinos">Treinos</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="glicemia">Glicemia</TabsTrigger>
        </TabsList>
        <TabsContent value="dietas"><AssignmentList items={filterAss("dieta")} icon={Utensils} empty="Nenhuma dieta enviada" /></TabsContent>
        <TabsContent value="treinos"><AssignmentList items={filterAss("treino")} icon={Activity} empty="Nenhum treino enviado" /></TabsContent>
        <TabsContent value="receitas"><AssignmentList items={filterAss("receita")} icon={FileText} empty="Nenhuma receita enviada" /></TabsContent>
        <TabsContent value="glicemia" className="mt-3"><PacienteGlicemiaPanel patientId={patient.id} /></TabsContent>
      </Tabs>

      <div>
        <h2 className="text-sm font-bold mb-2 mt-4">Mais</h2>
        <div className="grid grid-cols-2 gap-2">
          <QuickItem to="/analisar-refeicao" label="Refeições" icon={Camera} />
          <QuickItem to="/evolucao-corporal" label="Evolução" icon={TrendingUp} />
          <QuickItem to="/lista-compras" label="Lista compras" icon={FileText} />
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3 w-3" /><span className="truncate">{children}</span></div>
);

const AssignmentList = ({ items, icon: Icon, empty }: { items: Assignment[]; icon: any; empty: string }) => {
  if (items.length === 0) return <div className="py-6 text-center text-xs text-muted-foreground">{empty}</div>;
  return (
    <div className="space-y-2 mt-3">
      {items.map((a) => (
        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
          <Icon className="h-4 w-4 text-primary" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{a.title}</div>
            <div className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">{a.status}</span>
        </div>
      ))}
    </div>
  );
};

const QuickItem = ({ to, label, icon: Icon, disabled }: { to: string; label: string; icon: any; disabled?: boolean }) => (
  <Link to={disabled ? "#" : to}
    className={`p-3 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2 ${disabled ? "opacity-50 pointer-events-none" : "hover:border-primary/40"}`}>
    <Icon className="h-4 w-4 text-primary" />
    <span className="text-xs font-semibold">{label}</span>
  </Link>
);

export default PacienteDetalhe;

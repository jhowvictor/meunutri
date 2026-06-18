import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Save } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { callEngineAi, engineSystemPrompts } from "@/lib/engineAi";

interface Assignment { id: string; title: string; assignment_type: string; content: string | null; patient_id: string; }
interface Patient { id: string; full_name: string; goal: string | null; patient_user_id: string | null; }

const Adaptacao = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Record<string, Patient>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("patient_assignments").select("id, title, assignment_type, content, patient_id")
        .eq("professional_id", user.id).order("created_at", { ascending: false }).limit(50);
      setAssignments(data || []);
      const ids = Array.from(new Set((data || []).map((a: Assignment) => a.patient_id)));
      if (ids.length) {
        const { data: pats } = await (supabase as any)
          .from("patients").select("id, full_name, goal, patient_user_id").in("id", ids);
        const map: Record<string, Patient> = {};
        (pats || []).forEach((p: Patient) => { map[p.id] = p; });
        setPatients(map);
      }
    })();
  }, [user]);

  const selected = assignments.find((a) => a.id === selectedId);
  const patient = selected ? patients[selected.patient_id] : null;

  const generate = async () => {
    if (!selected || !user) return;
    setLoading(true);
    try {
      let context = "";
      if (patient?.patient_user_id) {
        const { data: bm } = await (supabase as any).from("body_measurements")
          .select("weight_kg, measured_at").eq("user_id", patient.patient_user_id)
          .order("measured_at", { ascending: false }).limit(5);
        if (bm?.length) context += `\nÚltimas medidas: ${bm.map((b: any) => `${b.weight_kg}kg em ${new Date(b.measured_at).toLocaleDateString("pt-BR")}`).join("; ")}`;
      }
      const prompt = `Plano atual (${selected.assignment_type}): ${selected.title}\n\nConteúdo:\n${selected.content || "(sem conteúdo registrado)"}\n\nObjetivo do paciente: ${patient?.goal || "não informado"}${context}\n\nFeedback/observações para ajuste: ${feedback || "(nenhum)"}\n\nProponha uma NOVA VERSÃO ajustada com substituições claras (alimento por alimento ou exercício por exercício) e justificativas curtas. Mantenha estrutura editável.`;
      const result = await callEngineAi(engineSystemPrompts.adaptation, prompt, 1500);
      setOutput(result);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar adaptação");
    } finally { setLoading(false); }
  };

  const saveVersion = async () => {
    if (!selected || !user || !output) return;
    const { data: existing } = await (supabase as any)
      .from("plan_versions").select("version_number").eq("assignment_id", selected.id)
      .order("version_number", { ascending: false }).limit(1);
    const next = (existing?.[0]?.version_number || 1) + 1;
    const { error } = await (supabase as any).from("plan_versions").insert({
      assignment_id: selected.id, professional_id: user.id, version_number: next, content: output, notes: feedback,
    });
    if (error) return toast.error(error.message);
    toast.success(`Versão v${next} salva`);
  };

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Motor de Adaptação</h1>
      </header>

      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-muted-foreground">Plano enviado</label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger><SelectValue placeholder="Selecione um plano" /></SelectTrigger>
          <SelectContent>
            {assignments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                [{a.assignment_type}] {a.title} — {patients[a.patient_id]?.full_name || ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-muted-foreground">Feedback / observações</label>
        <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Ex: paciente perdeu 2kg, relata fome à noite, prefere mais proteína..." rows={3} />
      </div>

      <Button onClick={generate} disabled={!selected || loading} className="w-full">
        <Sparkles className="h-4 w-4 mr-2" /> {loading ? "Gerando sugestão..." : "Gerar nova versão"}
      </Button>

      {output && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Sugestão (editável)</label>
          <Textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={14} />
          <Button onClick={saveVersion} variant="secondary" className="w-full">
            <Save className="h-4 w-4 mr-2" /> Salvar como nova versão
          </Button>
        </div>
      )}
    </div>
  );
};

export default Adaptacao;

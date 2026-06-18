import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Plus, Scale, Activity, Dumbbell, BarChart3, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface BM {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  muscle_mass_kg: number | null;
  waist_cm: number | null;
  notes: string | null;
}

const EvolucaoCorporal = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<BM[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ measured_at: "", weight_kg: "", body_fat_pct: "", muscle_mass_kg: "", waist_cm: "", notes: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("body_measurements").select("*").eq("user_id", user.id).order("measured_at", { ascending: true });
    setItems((data as BM[]) || []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const save = async () => {
    if (!user) return;
    if (!form.measured_at || !form.weight_kg) return toast.error("Informe a data e o peso.");
    const payload: any = {
      user_id: user.id,
      measured_at: form.measured_at,
      weight_kg: parseFloat(form.weight_kg),
      body_fat_pct: form.body_fat_pct ? parseFloat(form.body_fat_pct) : null,
      muscle_mass_kg: form.muscle_mass_kg ? parseFloat(form.muscle_mass_kg) : null,
      waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
      notes: form.notes || null,
    };
    const { error } = await (supabase as any).from("body_measurements").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Medição registrada!");
    setOpen(false);
    setForm({ measured_at: "", weight_kg: "", body_fat_pct: "", muscle_mass_kg: "", waist_cm: "", notes: "" });
    load();
  };

  const first = items[0];
  const latest = items[items.length - 1];
  const chartData = items.map((m) => ({
    date: new Date(m.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    peso: m.weight_kg,
    gordura: m.body_fat_pct,
    musculo: m.muscle_mass_kg,
  }));

  const diff = first && latest && first.weight_kg && latest.weight_kg ? (latest.weight_kg - first.weight_kg).toFixed(1) : "0";

  const exportPdf = () => {
    if (items.length === 0) return toast.error("Nenhuma medição para exportar.");
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("Relatório de Evolução Corporal", 14, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);

    if (first && latest) {
      doc.setFontSize(12); doc.setFont("helvetica", "bold");
      doc.text("Resumo", 14, 40);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(`Período: ${first.measured_at} → ${latest.measured_at}`, 14, 48);
      doc.text(`Peso inicial: ${first.weight_kg ?? "-"} kg | atual: ${latest.weight_kg ?? "-"} kg | variação: ${diff} kg`, 14, 55);
      if (first.body_fat_pct && latest.body_fat_pct)
        doc.text(`% Gordura: ${first.body_fat_pct}% → ${latest.body_fat_pct}%`, 14, 62);
      if (first.muscle_mass_kg && latest.muscle_mass_kg)
        doc.text(`Massa muscular: ${first.muscle_mass_kg} kg → ${latest.muscle_mass_kg} kg`, 14, 69);
    }

    let y = 85;
    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("Histórico", 14, y); y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("Data | Peso | %Gord | Músculo | Cintura", 14, y); y += 6;
    items.forEach((m) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(`${m.measured_at} | ${m.weight_kg ?? "-"} | ${m.body_fat_pct ?? "-"} | ${m.muscle_mass_kg ?? "-"} | ${m.waist_cm ?? "-"}`, 14, y);
      y += 6;
    });
    doc.save(`evolucao-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Relatório exportado!");
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link to="/"><Button variant="ghost" size="icon" className="mr-2"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <h1 className="text-2xl font-bold flex items-center"><TrendingUp className="h-6 w-6 mr-2 text-primary" />Evolução Corporal</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat icon={Scale} label="Peso atual" value={latest?.weight_kg ? `${latest.weight_kg} kg` : "—"} />
        <Stat icon={Activity} label="Variação" value={`${diff} kg`} />
        <Stat icon={BarChart3} label="% Gordura" value={latest?.body_fat_pct ? `${latest.body_fat_pct}%` : "—"} />
        <Stat icon={Dumbbell} label="Músculo" value={latest?.muscle_mass_kg ? `${latest.muscle_mass_kg} kg` : "—"} />
      </div>

      {chartData.length > 1 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-6">
          <h2 className="font-bold mb-2 text-sm">Evolução do peso</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" /><YAxis domain={["dataMin - 2", "dataMax + 2"]} /><Tooltip />
                <Area type="monotone" dataKey="peso" stroke="hsl(var(--primary))" fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chartData.some((d) => d.gordura || d.musculo) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-6">
          <h2 className="font-bold mb-2 text-sm">Composição corporal</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" /><YAxis /><Tooltip />
                <Line type="monotone" dataKey="gordura" stroke="#f59e0b" name="% Gordura" />
                <Line type="monotone" dataKey="musculo" stroke="#10b981" name="Músculo (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button onClick={() => setOpen(true)} className="flex-1"><Plus className="h-4 w-4 mr-2" />Nova medição</Button>
        <Button variant="outline" onClick={exportPdf}><FileText className="h-4 w-4 mr-2" />PDF</Button>
      </div>

      <div className="space-y-2">
        {items.slice().reverse().map((m) => (
          <div key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm flex justify-between">
            <div>
              <div className="font-semibold">{new Date(m.measured_at).toLocaleDateString("pt-BR")}</div>
              <div className="text-xs text-muted-foreground">
                {m.weight_kg ? `${m.weight_kg} kg` : ""} {m.body_fat_pct ? ` • ${m.body_fat_pct}%` : ""} {m.muscle_mass_kg ? ` • ${m.muscle_mass_kg} kg músculo` : ""}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">Nenhuma medição registrada ainda.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova medição</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Data</Label><Input type="date" value={form.measured_at} onChange={(e) => setForm({ ...form, measured_at: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Peso (kg)</Label><Input type="number" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></div>
              <div><Label>% Gordura</Label><Input type="number" step="0.1" value={form.body_fat_pct} onChange={(e) => setForm({ ...form, body_fat_pct: e.target.value })} /></div>
              <div><Label>Massa muscular (kg)</Label><Input type="number" step="0.1" value={form.muscle_mass_kg} onChange={(e) => setForm({ ...form, muscle_mass_kg: e.target.value })} /></div>
              <div><Label>Cintura (cm)</Label><Input type="number" step="0.1" value={form.waist_cm} onChange={(e) => setForm({ ...form, waist_cm: e.target.value })} /></div>
            </div>
            <div><Label>Observações</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-primary mb-1" />
    <div className="text-lg font-extrabold">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
  </div>
);

export default EvolucaoCorporal;

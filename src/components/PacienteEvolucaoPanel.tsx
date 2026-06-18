import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BM {
  id: string; measured_at: string;
  weight_kg: number | null; body_fat_pct: number | null; muscle_mass_kg: number | null;
}

const PacienteEvolucaoPanel = ({ patientUserId }: { patientUserId: string | null }) => {
  const [items, setItems] = useState<BM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientUserId) { setLoading(false); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from("body_measurements").select("*").eq("user_id", patientUserId)
        .order("measured_at", { ascending: true });
      setItems((data as BM[]) || []);
      setLoading(false);
    })();
  }, [patientUserId]);

  if (!patientUserId) return <div className="py-6 text-center text-xs text-muted-foreground">Paciente ainda não vinculou conta.</div>;
  if (loading) return <div className="py-6 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;
  if (items.length === 0) return <div className="py-6 text-center text-xs text-muted-foreground">Sem medições</div>;

  const data = items.map((m) => ({
    date: new Date(m.measured_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    peso: m.weight_kg, gordura: m.body_fat_pct, musculo: m.muscle_mass_kg,
  }));
  const first = items[0]; const last = items[items.length - 1];
  const diff = first.weight_kg && last.weight_kg ? (last.weight_kg - first.weight_kg).toFixed(1) : "0";

  return (
    <div className="space-y-3 mt-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Peso atual" value={last.weight_kg ? `${last.weight_kg} kg` : "—"} />
        <Stat label="Variação" value={`${diff} kg`} />
        <Stat label="Medições" value={items.length.toString()} />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
    <div className="text-base font-extrabold">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
  </div>
);

export default PacienteEvolucaoPanel;

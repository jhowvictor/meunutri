import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Loader2 } from "lucide-react";

interface MealLog {
  id: string;
  analysis: string | null;
  calories: number | null;
  carbs_g: number | null;
  protein_g: number | null;
  fat_g: number | null;
  logged_at: string;
}

const PacienteRefeicoesPanel = ({ patientUserId }: { patientUserId: string | null }) => {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientUserId) { setLoading(false); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from("meal_logs").select("*").eq("user_id", patientUserId)
        .order("logged_at", { ascending: false }).limit(50);
      setMeals((data as MealLog[]) || []);
      setLoading(false);
    })();
  }, [patientUserId]);

  if (!patientUserId) return <div className="py-6 text-center text-xs text-muted-foreground">Paciente ainda não vinculou conta.</div>;
  if (loading) return <div className="py-6 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;

  const last7 = meals.filter((m) => new Date(m.logged_at) > new Date(Date.now() - 7 * 86400000));
  const avgCal = last7.length > 0 ? Math.round(last7.reduce((s, m) => s + (m.calories || 0), 0) / last7.length) : 0;

  return (
    <div className="space-y-3 mt-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Refeições (7d)" value={last7.length.toString()} />
        <Stat label="Cal. média" value={`${avgCal} kcal`} />
        <Stat label="Total" value={meals.length.toString()} />
      </div>
      {meals.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">Nenhuma refeição registrada</div>
      ) : (
        <div className="space-y-2">
          {meals.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">{new Date(m.logged_at).toLocaleString("pt-BR")}</span>
                {m.calories && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">{m.calories} kcal</span>}
              </div>
              {m.analysis && <p className="text-[11px] text-muted-foreground line-clamp-3">{m.analysis}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
    <div className="text-base font-extrabold">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
  </div>
);

export default PacienteRefeicoesPanel;

import { useEffect, useState } from "react";
import { Droplet, Plus, Loader2, Target, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface Reading { id: string; value_mg_dl: number; reading_type: string; measured_at: string; notes: string | null; }
interface Goal { id?: string; reading_type: string; min_value: number; max_value: number; }

const types = [
  { value: "jejum", label: "Jejum", defMin: 70, defMax: 99 },
  { value: "pos_refeicao", label: "Pós-refeição", defMin: 70, defMax: 140 },
  { value: "antes_dormir", label: "Antes de dormir", defMin: 90, defMax: 150 },
];
const typeLabel: Record<string, string> = {
  jejum: "Jejum", pos_refeicao: "Pós-refeição", antes_dormir: "Antes de dormir", aleatorio: "Aleatória",
};

export default function PacienteGlicemiaPanel({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [goals, setGoals] = useState<Record<string, Goal>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: r }, { data: g }] = await Promise.all([
      (supabase as any).from("glucose_readings").select("*").eq("patient_id", patientId).order("measured_at", { ascending: false }).limit(20),
      (supabase as any).from("glucose_goals").select("*").eq("patient_id", patientId),
    ]);
    setReadings((r as Reading[]) || []);
    const goalMap: Record<string, Goal> = {};
    types.forEach((t) => {
      const found = (g as Goal[] | null)?.find((x) => x.reading_type === t.value);
      goalMap[t.value] = found || { reading_type: t.value, min_value: t.defMin, max_value: t.defMax };
    });
    setGoals(goalMap);
  };

  useEffect(() => { load(); }, [patientId]);

  const saveGoals = async () => {
    if (!user) return;
    setSaving(true);
    const rows = Object.values(goals).map((g) => ({
      patient_id: patientId,
      professional_id: user.id,
      reading_type: g.reading_type,
      min_value: g.min_value,
      max_value: g.max_value,
    }));
    const { error } = await (supabase as any).from("glucose_goals").upsert(rows, { onConflict: "patient_id,reading_type" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Metas salvas");
    load();
  };

  const colorFor = (v: number, type: string) => {
    const g = goals[type];
    if (!g) return "text-foreground";
    if (v < g.min_value) return "text-blue-400";
    if (v > g.max_value) return "text-rose-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">Metas glicêmicas (mg/dL)</h3>
        </div>
        {types.map((t) => {
          const g = goals[t.value] || { reading_type: t.value, min_value: t.defMin, max_value: t.defMax };
          return (
            <div key={t.value} className="grid grid-cols-[1fr_70px_70px] gap-2 items-end">
              <div>
                <Label className="text-[10px] text-muted-foreground">{t.label}</Label>
                <div className="text-xs text-muted-foreground">faixa</div>
              </div>
              <div>
                <Label className="text-[9px] text-muted-foreground">Mín</Label>
                <Input type="number" value={g.min_value} onChange={(e) => setGoals({ ...goals, [t.value]: { ...g, min_value: parseFloat(e.target.value) || 0 } })} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-[9px] text-muted-foreground">Máx</Label>
                <Input type="number" value={g.max_value} onChange={(e) => setGoals({ ...goals, [t.value]: { ...g, max_value: parseFloat(e.target.value) || 0 } })} className="h-9 text-sm" />
              </div>
            </div>
          );
        })}
        <Button onClick={saveGoals} disabled={saving} size="sm" className="w-full rounded-full bg-primary">
          {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
          Salvar metas
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
          <Droplet className="h-4 w-4 text-rose-400" /> Últimas medições
        </h3>
        {readings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center text-xs text-muted-foreground">
            O paciente ainda não registrou medições
          </div>
        ) : (
          <div className="space-y-2">
            {readings.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                <div className={`text-lg font-extrabold w-14 ${colorFor(r.value_mg_dl, r.reading_type)}`}>{r.value_mg_dl}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{typeLabel[r.reading_type] || r.reading_type}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(r.measured_at).toLocaleString("pt-BR")}
                    {r.notes ? ` • ${r.notes}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

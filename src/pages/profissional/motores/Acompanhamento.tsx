import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string; full_name: string; goal: string | null;
  adherence_status: string | null; last_activity_at: string | null;
}

const daysSince = (iso: string | null) => {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
};

const statusOf = (p: Patient) => {
  const d = daysSince(p.last_activity_at);
  if (d <= 7) return { label: "Ativo", color: "bg-emerald-400" };
  if (d <= 14) return { label: "Alerta", color: "bg-amber-400" };
  return { label: "Inativo", color: "bg-rose-400" };
};

const Acompanhamento = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [adesao, setAdesao] = useState<Record<string, { total: number; done: number }>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: pats } = await (supabase as any).from("patients")
        .select("id, full_name, goal, adherence_status, last_activity_at")
        .eq("professional_id", user.id);
      setPatients(pats || []);
      const { data: ass } = await (supabase as any).from("patient_assignments")
        .select("patient_id, status").eq("professional_id", user.id);
      const map: Record<string, { total: number; done: number }> = {};
      (ass || []).forEach((a: any) => {
        map[a.patient_id] = map[a.patient_id] || { total: 0, done: 0 };
        map[a.patient_id].total++;
        if (a.status === "concluido" || a.status === "completed") map[a.patient_id].done++;
      });
      setAdesao(map);
    })();
  }, [user]);

  const sorted = useMemo(() => [...patients].sort((a, b) => daysSince(a.last_activity_at) - daysSince(b.last_activity_at)), [patients]);
  const inativos = sorted.filter((p) => daysSince(p.last_activity_at) > 14);

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Motor de Acompanhamento</h1>
      </header>

      {inativos.length > 0 && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/5 p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-rose-300">{inativos.length} paciente(s) sem atividade há +14 dias</div>
            <div className="text-rose-200/70">Considere enviar uma mensagem de reengajamento.</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((p) => {
          const s = statusOf(p);
          const ad = adesao[p.id];
          const pct = ad?.total ? Math.round((ad.done / ad.total) * 100) : 0;
          return (
            <Link key={p.id} to={`/profissional/paciente/${p.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40">
              <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{p.full_name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {s.label} · {p.last_activity_at ? `${daysSince(p.last_activity_at)}d atrás` : "sem atividade"} · adesão {pct}% ({ad?.done || 0}/{ad?.total || 0})
                </div>
              </div>
            </Link>
          );
        })}
        {sorted.length === 0 && <div className="text-center text-xs text-muted-foreground py-6">Nenhum paciente cadastrado.</div>}
      </div>
    </div>
  );
};

export default Acompanhamento;

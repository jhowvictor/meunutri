import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Patient {
  id: string;
  full_name: string;
  email: string | null;
  city: string | null;
  goal: string | null;
  adherence_status: string | null;
  last_activity_at: string | null;
  invite_status: string;
}

const dotColor: Record<string, string> = { green: "bg-emerald-400", yellow: "bg-amber-400", red: "bg-rose-400" };
const statusLabel: Record<string, string> = { green: "Evoluindo bem", yellow: "Oscilando", red: "Sem progresso" };

const Pacientes = () => {
  const { user } = useAuth();
  const [list, setList] = useState<Patient[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("patients")
        .select("*")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });
      setList((data as Patient[]) || []);
    })();
  }, [user]);

  const filtered = list.filter((p) => {
    const matchQ = !q || p.full_name.toLowerCase().includes(q.toLowerCase()) || (p.email || "").toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "all" || p.adherence_status === filter;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center justify-between">
        <Link to="/profissional" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Meus Pacientes</h1>
        <Link to="/profissional/pacientes/novo">
          <Button size="icon" className="rounded-full bg-primary h-9 w-9"><Plus className="h-4 w-4" /></Button>
        </Link>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paciente" className="pl-9" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Todos" },
          { id: "green", label: "🟢 Evoluindo" },
          { id: "yellow", label: "🟡 Oscilando" },
          { id: "red", label: "🔴 Sem progresso" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap ${
              filter === f.id ? "bg-primary/15 border-primary text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
            }`}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center">
          <p className="text-sm font-medium">Nenhum paciente encontrado</p>
          <Link to="/profissional/pacientes/novo">
            <Button size="sm" className="mt-4 rounded-full bg-primary"><Plus className="h-4 w-4 mr-1" /> Adicionar primeiro paciente</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Link key={p.id} to={`/profissional/paciente/${p.id}`}
              className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/40 transition">
              <div className="h-11 w-11 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary">
                {p.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.full_name}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {p.goal || "Sem objetivo"} {p.city ? `• ${p.city}` : ""}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`h-2.5 w-2.5 rounded-full ${dotColor[p.adherence_status || "green"]}`} />
                <span className="text-[9px] text-muted-foreground mt-1">{statusLabel[p.adherence_status || "green"]}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pacientes;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import MonthlyReportButton from "@/components/MonthlyReportButton";

interface Patient { id: string; full_name: string; patient_user_id: string | null; }

const Relatorios = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any).from("patients")
        .select("id, full_name, patient_user_id").eq("professional_id", user.id).order("full_name");
      setPatients(data || []);
    })();
  }, [user]);

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Motor de Relatórios</h1>
      </header>
      <p className="text-xs text-muted-foreground">
        Gere relatórios consolidados em PDF dos seus pacientes (refeições, evolução, glicemia e planos).
      </p>
      <div className="space-y-2">
        {patients.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
            <div className="font-semibold text-sm">{p.full_name}</div>
            {user && (
              <MonthlyReportButton
                professionalId={user.id}
                patientId={p.id}
                patientName={p.full_name}
                patientUserId={p.patient_user_id}
              />
            )}
          </div>
        ))}
        {patients.length === 0 && <div className="text-center text-xs text-muted-foreground py-6">Nenhum paciente cadastrado.</div>}
      </div>
    </div>
  );
};

export default Relatorios;

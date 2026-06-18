import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateProfessionalPdf } from "@/lib/proPdf";
import { toast } from "@/components/ui/sonner";

interface Props { professionalId: string; patientId: string; patientName: string; patientUserId: string | null }

const MonthlyReportButton = ({ professionalId, patientId, patientName, patientUserId }: Props) => {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const [{ data: meals }, { data: bm }, { data: glu }, { data: ass }] = await Promise.all([
        patientUserId ? (supabase as any).from("meal_logs").select("*").eq("user_id", patientUserId).gte("logged_at", sinceIso) : Promise.resolve({ data: [] }),
        patientUserId ? (supabase as any).from("body_measurements").select("*").eq("user_id", patientUserId).gte("measured_at", sinceIso.slice(0, 10)) : Promise.resolve({ data: [] }),
        (supabase as any).from("glucose_readings").select("*").eq("patient_id", patientId).gte("measured_at", sinceIso),
        (supabase as any).from("patient_assignments").select("*").eq("patient_id", patientId).gte("created_at", sinceIso),
      ]);

      const mealsArr = (meals as any[]) || [];
      const bmArr = (bm as any[]) || [];
      const gluArr = (glu as any[]) || [];
      const assArr = (ass as any[]) || [];

      const avgCal = mealsArr.length ? Math.round(mealsArr.reduce((s, m) => s + (m.calories || 0), 0) / mealsArr.length) : 0;
      const avgGlu = gluArr.length ? Math.round(gluArr.reduce((s, g) => s + (g.value_mg_dl || 0), 0) / gluArr.length) : 0;
      const firstBm = bmArr[0]; const lastBm = bmArr[bmArr.length - 1];
      const weightDiff = firstBm?.weight_kg && lastBm?.weight_kg ? (lastBm.weight_kg - firstBm.weight_kg).toFixed(1) : "—";

      const content = `
RESUMO DOS ÚLTIMOS 30 DIAS

ALIMENTAÇÃO
• Refeições registradas: ${mealsArr.length}
• Caloria média: ${avgCal} kcal/refeição

EVOLUÇÃO CORPORAL
• Medições: ${bmArr.length}
• Variação de peso: ${weightDiff} kg
${lastBm?.body_fat_pct ? `• % Gordura atual: ${lastBm.body_fat_pct}%` : ""}
${lastBm?.muscle_mass_kg ? `• Massa muscular atual: ${lastBm.muscle_mass_kg} kg` : ""}

CONTROLE GLICÊMICO
• Medições: ${gluArr.length}
• Glicemia média: ${avgGlu} mg/dL

PLANOS ENVIADOS
• Total no período: ${assArr.length}
${assArr.slice(0, 10).map((a) => `• ${a.assignment_type.toUpperCase()} — ${a.title} (${new Date(a.created_at).toLocaleDateString("pt-BR")})`).join("\n")}

OBSERVAÇÕES DO PROFISSIONAL
___________________________________________________
___________________________________________________
___________________________________________________
      `.trim();

      const doc = await generateProfessionalPdf(professionalId, {
        title: "Relatório Mensal",
        subtitle: `Período: ${since.toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")}`,
        patientName,
        content,
      });
      doc.save(`relatorio-${patientName.replace(/\s+/g, "_")}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Relatório gerado!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar relatório");
    } finally { setLoading(false); }
  };

  return (
    <Button onClick={generate} disabled={loading} variant="outline" className="w-full">
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
      Relatório Mensal
    </Button>
  );
};

export default MonthlyReportButton;

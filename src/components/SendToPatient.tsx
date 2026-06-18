import { useEffect, useState } from "react";
import { Send, MessageCircle, Mail, Save, FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { generateProfessionalPdf } from "@/lib/proPdf";

interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
}

interface Props {
  contentType: "dieta" | "treino" | "receita";
  title: string;
  content: string;
}

export default function SendToPatient({ contentType, title, content }: Props) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState(title);
  const [via, setVia] = useState<"whatsapp" | "email" | "salvar">("whatsapp");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("patients")
        .select("id, full_name, phone, email")
        .eq("professional_id", user.id)
        .order("full_name");
      setPatients(data || []);
    })();
  }, [open, user]);

  if (profile?.account_type !== "profissional") return null;

  const selected = patients.find((p) => p.id === patientId);

  const buildMessage = () =>
    `Olá ${selected?.full_name?.split(" ")[0] || ""}!\n\nSegue seu plano: *${customTitle}*\n\n${content}\n\n— ${profile?.full_name || "Seu profissional"}`;

  const handleSend = async () => {
    if (!user || !selected) return;
    setLoading(true);
    try {
      // Save assignment
      await (supabase as any).from("patient_assignments").insert({
        professional_id: user.id,
        patient_id: selected.id,
        assignment_type: contentType,
        title: customTitle,
        content: { text: content },
        sent_via: via,
        status: "enviado",
      });

      if (via === "whatsapp" && selected.phone) {
        const phone = selected.phone.replace(/\D/g, "");
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`;
        window.open(url, "_blank");
      } else if (via === "email" && selected.email) {
        const url = `mailto:${selected.email}?subject=${encodeURIComponent(customTitle)}&body=${encodeURIComponent(buildMessage())}`;
        window.location.href = url;
      }

      toast.success("Enviado e registrado no histórico do paciente.");
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleProPdf = async () => {
    if (!user) return;
    try {
      const doc = await generateProfessionalPdf(user.id, {
        title: customTitle,
        content,
        patientName: selected?.full_name,
        subtitle: contentType === "dieta" ? "Plano Alimentar" : contentType === "treino" ? "Plano de Treino" : "Receita Personalizada",
      });
      doc.save(`${customTitle.replace(/\s+/g, "_")}.pdf`);
    } catch (e: any) {
      toast.error("Erro ao gerar PDF.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Send className="h-4 w-4 mr-1" />
          Enviar para paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar {contentType} para paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Paciente</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
                {patients.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Nenhum paciente cadastrado
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Título</Label>
            <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
          </div>

          <div>
            <Label>Canal de envio</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Button
                type="button"
                variant={via === "whatsapp" ? "default" : "outline"}
                size="sm"
                onClick={() => setVia("whatsapp")}
              >
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
              </Button>
              <Button
                type="button"
                variant={via === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setVia("email")}
              >
                <Mail className="h-4 w-4 mr-1" /> E-mail
              </Button>
              <Button
                type="button"
                variant={via === "salvar" ? "default" : "outline"}
                size="sm"
                onClick={() => setVia("salvar")}
              >
                <Save className="h-4 w-4 mr-1" /> Salvar
              </Button>
            </div>
            {via === "whatsapp" && selected && !selected.phone && (
              <p className="text-xs text-destructive mt-1">Paciente sem telefone cadastrado.</p>
            )}
            {via === "email" && selected && !selected.email && (
              <p className="text-xs text-destructive mt-1">Paciente sem e-mail cadastrado.</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleProPdf} disabled={!patientId}>
            <FileDown className="h-4 w-4 mr-1" />
            PDF profissional
          </Button>
          <Button onClick={handleSend} disabled={!patientId || loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

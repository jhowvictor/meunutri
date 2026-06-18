import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const NovoPaciente = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    full_name: "", email: "", phone: "", city: "", goal: "", notes: "",
  });

  const save = async () => {
    if (!user || !data.full_name.trim()) {
      toast.error("Informe ao menos o nome do paciente");
      return;
    }
    setSaving(true);
    const { error, data: created } = await (supabase as any)
      .from("patients")
      .insert({
        professional_id: user.id,
        full_name: data.full_name.trim(),
        email: data.email || null,
        phone: data.phone || null,
        city: data.city || null,
        goal: data.goal || null,
        notes: data.notes || null,
        invite_token: crypto.randomUUID(),
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Paciente adicionado");
    navigate(`/profissional/paciente/${created.id}`);
  };

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3">
        <Link to="/profissional/pacientes" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Novo paciente</h1>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Nome completo *</Label>
          <Input value={data.full_name} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">E-mail</Label>
            <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Telefone</Label>
            <Input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Cidade</Label>
            <Input value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Objetivo</Label>
            <Input placeholder="Ex: Emagrecimento" value={data.goal} onChange={(e) => setData({ ...data, goal: e.target.value })} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Observações</Label>
          <Input value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })} />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full rounded-full bg-primary font-semibold">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
        Adicionar paciente
      </Button>
    </div>
  );
};

export default NovoPaciente;

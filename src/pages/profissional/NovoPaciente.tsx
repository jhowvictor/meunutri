import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, UserPlus, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";

const NovoPaciente = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const isEdit = !!editId;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [data, setData] = useState({
    full_name: "", email: "", phone: "", city: "", goal: "", notes: "",
  });

  useEffect(() => {
    if (!editId || !user) return;
    (async () => {
      const { data: p } = await (supabase as any)
        .from("patients").select("*").eq("id", editId).maybeSingle();
      if (p) setData({
        full_name: p.full_name || "", email: p.email || "", phone: p.phone || "",
        city: p.city || "", goal: p.goal || "", notes: p.notes || "",
      });
      setLoading(false);
    })();
  }, [editId, user]);

  const save = async () => {
    if (!user || !data.full_name.trim()) {
      toast.error("Informe ao menos o nome do paciente");
      return;
    }
    setSaving(true);
    if (isEdit) {
      const { error } = await (supabase as any)
        .from("patients")
        .update({
          full_name: data.full_name.trim(),
          email: data.email || null, phone: data.phone || null,
          city: data.city || null, goal: data.goal || null, notes: data.notes || null,
        })
        .eq("id", editId);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Paciente atualizado");
      navigate(`/profissional/paciente/${editId}`);
    } else {
      const { error, data: created } = await (supabase as any)
        .from("patients")
        .insert({
          professional_id: user.id,
          full_name: data.full_name.trim(),
          email: data.email || null, phone: data.phone || null,
          city: data.city || null, goal: data.goal || null, notes: data.notes || null,
          invite_token: crypto.randomUUID(),
        })
        .select().single();
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Paciente adicionado");
      navigate(`/profissional/paciente/${created.id}`);
    }
  };

  const remove = async () => {
    if (!editId) return;
    const { error } = await (supabase as any).from("patients").delete().eq("id", editId);
    if (error) return toast.error(error.message);
    toast.success("Paciente removido");
    navigate("/profissional/pacientes");
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3">
        <Link to="/profissional/pacientes" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold flex-1">{isEdit ? "Editar paciente" : "Novo paciente"}</h1>
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
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : isEdit ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
        {isEdit ? "Salvar alterações" : "Adicionar paciente"}
      </Button>

      {isEdit && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full rounded-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
              <Trash2 className="h-4 w-4 mr-2" /> Excluir paciente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{data.full_name}</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={remove} className="bg-rose-500 hover:bg-rose-600">Sim, excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default NovoPaciente;

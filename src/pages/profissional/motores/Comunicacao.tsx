import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Copy, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { applyVars, messageTemplatesSeed } from "@/lib/engineAi";

interface Tmpl { id: string; category: string; title: string; body: string; }
interface Patient { id: string; full_name: string; phone: string | null; email: string | null; }

const Comunicacao = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Tmpl[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [proName, setProName] = useState("");
  const [tmplId, setTmplId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [body, setBody] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase as any).from("engine_message_templates")
      .select("*").eq("professional_id", user.id).order("created_at", { ascending: true });
    if (!data?.length) {
      const seed = messageTemplatesSeed.map((t) => ({ ...t, professional_id: user.id, is_default: true }));
      await (supabase as any).from("engine_message_templates").insert(seed);
      const { data: re } = await (supabase as any).from("engine_message_templates")
        .select("*").eq("professional_id", user.id).order("created_at", { ascending: true });
      setTemplates(re || []);
    } else setTemplates(data);
  };

  useEffect(() => {
    if (!user) return;
    load();
    (async () => {
      const { data: pats } = await (supabase as any).from("patients")
        .select("id, full_name, phone, email").eq("professional_id", user.id).order("full_name");
      setPatients(pats || []);
      const { data: pp } = await (supabase as any).from("professional_profiles")
        .select("display_name").eq("id", user.id).maybeSingle();
      setProName(pp?.display_name || "Seu Profissional");
    })();
  }, [user]);

  useEffect(() => {
    const t = templates.find((x) => x.id === tmplId);
    const p = patients.find((x) => x.id === patientId);
    if (t) setBody(applyVars(t.body, { nome: p?.full_name?.split(" ")[0] || "{{nome}}", profissional: proName }));
  }, [tmplId, patientId, templates, patients, proName]);

  const sendWhatsapp = () => {
    const p = patients.find((x) => x.id === patientId);
    if (!p?.phone) return toast.error("Paciente sem telefone cadastrado");
    const phone = p.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`, "_blank");
  };
  const sendEmail = async () => {
    const p = patients.find((x) => x.id === patientId);
    if (!p?.email) return toast.error("Paciente sem email cadastrado");
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: { to: p.email, subject: "Mensagem", text: body, fromName: proName },
    });
    if (error || (data as any)?.error) {
      toast.error("Falha no envio. Verifique a conexão Resend.");
      return;
    }
    toast.success("E-mail enviado");
  };

  const copy = () => { navigator.clipboard.writeText(body); toast.success("Copiado"); };

  const createTmpl = async () => {
    if (!user || !newTitle || !newBody) return;
    const { error } = await (supabase as any).from("engine_message_templates").insert({
      professional_id: user.id, category: "personalizado", title: newTitle, body: newBody, is_default: false,
    });
    if (error) return toast.error(error.message);
    setNewTitle(""); setNewBody(""); load();
  };

  const removeTmpl = async (id: string) => {
    const { error } = await (supabase as any).from("engine_message_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Motor de Comunicação</h1>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Select value={patientId} onValueChange={setPatientId}>
          <SelectTrigger><SelectValue placeholder="Paciente" /></SelectTrigger>
          <SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={tmplId} onValueChange={setTmplId}>
          <SelectTrigger><SelectValue placeholder="Modelo" /></SelectTrigger>
          <SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Selecione um modelo ou escreva..." />

      <div className="grid grid-cols-3 gap-2">
        <Button onClick={sendWhatsapp} className="bg-emerald-600 hover:bg-emerald-700"><MessageCircle className="h-4 w-4 mr-1" /> WhatsApp</Button>
        <Button onClick={sendEmail} variant="secondary"><Mail className="h-4 w-4 mr-1" /> Email</Button>
        <Button onClick={copy} variant="outline"><Copy className="h-4 w-4 mr-1" /> Copiar</Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
        <h2 className="text-sm font-bold">Meus modelos</h2>
        <div className="space-y-1">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-xs">
              <span className="flex-1 truncate">{t.title} <span className="text-muted-foreground">· {t.category}</span></span>
              {!(t as any).is_default && (
                <button onClick={() => removeTmpl(t.id)} className="text-rose-400"><Trash2 className="h-3 w-3" /></button>
              )}
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-white/10 space-y-2">
          <Input placeholder="Título do novo modelo" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Textarea placeholder="Corpo (use {{nome}} e {{profissional}})" value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={3} />
          <Button size="sm" onClick={createTmpl} className="w-full"><Plus className="h-3 w-3 mr-1" /> Adicionar modelo</Button>
        </div>
      </div>
    </div>
  );
};

export default Comunicacao;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, MessageCircle, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { callEngineAi, engineSystemPrompts, applyVars } from "@/lib/engineAi";

const categorias = [
  { value: "educativa", label: "Educativa" },
  { value: "motivacional", label: "Motivacional" },
  { value: "reengajamento", label: "Reengajamento" },
  { value: "boas-vindas", label: "Boas-vindas" },
  { value: "lembrete-consulta", label: "Lembrete de consulta" },
  { value: "lembrete-plano", label: "Lembrete do plano" },
  { value: "feedback", label: "Pedido de feedback" },
  { value: "check-in", label: "Check-in semanal" },
  { value: "parabens", label: "Parabéns / aniversário" },
  { value: "comemorar-resultado", label: "Comemorar resultado" },
  { value: "orientacao-diaria", label: "Orientação diária" },
  { value: "orientacao-semanal", label: "Orientação semanal" },
  { value: "dica-alimentar", label: "Dica alimentar" },
  { value: "dica-treino", label: "Dica de treino" },
  { value: "dica-sono", label: "Dica de sono" },
  { value: "dica-hidratacao", label: "Dica de hidratação" },
  { value: "saude-mental", label: "Saúde mental / bem-estar" },
  { value: "novidade", label: "Novidade / anúncio" },
  { value: "agendamento", label: "Agendamento" },
  { value: "pos-consulta", label: "Pós-consulta" },
  { value: "personalizada", label: "Personalizada (livre)" },
];

const tons = [
  { value: "acolhedor", label: "Acolhedor" },
  { value: "motivador", label: "Motivador" },
  { value: "objetivo", label: "Objetivo" },
  { value: "amigavel", label: "Amigável" },
  { value: "profissional", label: "Profissional" },
  { value: "informal", label: "Informal" },
];

const tamanhos = [
  { value: "curta", label: "Curta (1-2 linhas)" },
  { value: "media", label: "Média (3-4 linhas)" },
  { value: "longa", label: "Longa (5+ linhas)" },
];

const canais = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "ambos", label: "WhatsApp + E-mail" },
];

interface Patient { id: string; full_name: string; email: string | null; phone: string | null; }

const Conteudo = () => {
  const { user } = useAuth();
  const [cat, setCat] = useState("educativa");
  const [tom, setTom] = useState("acolhedor");
  const [tamanho, setTamanho] = useState("media");
  const [canal, setCanal] = useState("whatsapp");
  const [tema, setTema] = useState("");
  const [subject, setSubject] = useState("Mensagem do seu profissional");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [proName, setProName] = useState("Seu Profissional");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: pats } = await (supabase as any)
        .from("patients").select("id, full_name, email, phone")
        .eq("professional_id", user.id).order("full_name");
      setPatients(pats || []);
      const { data: pp } = await (supabase as any)
        .from("professional_profiles").select("display_name").eq("id", user.id).maybeSingle();
      setProName(pp?.display_name || "Seu Profissional");
    })();
  }, [user]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === patients.length) setSelected(new Set());
    else setSelected(new Set(patients.map((p) => p.id)));
  };

  const generate = async () => {
    setLoading(true);
    try {
      const tomLabel = tons.find((t) => t.value === tom)?.label || tom;
      const tamLabel = tamanhos.find((t) => t.value === tamanho)?.label || tamanho;
      const catLabel = categorias.find((c) => c.value === cat)?.label || cat;
      const prompt = `Categoria: ${catLabel}.
Tom desejado: ${tomLabel}.
Tamanho: ${tamLabel}.
Tema/contexto: ${tema || "geral"}.
Canal: ${canal}.

Gere UMA mensagem pronta para enviar a pacientes (não numere variações). Use {{nome}} para o nome do paciente e {{profissional}} para o nome do profissional. Não inclua saudações genéricas redundantes nem assinaturas extras.`;
      const r = await callEngineAi(engineSystemPrompts.content, prompt, 600);
      setOut(r);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const sendNow = async () => {
    if (!out.trim()) return toast.error("Gere ou escreva uma mensagem antes");
    if (selected.size === 0) return toast.error("Selecione ao menos 1 paciente");

    setSending(true);
    let okWa = 0, okEmail = 0, fail = 0;
    const targets = patients.filter((p) => selected.has(p.id));

    for (const p of targets) {
      const text = applyVars(out, { nome: p.full_name.split(" ")[0], profissional: proName });
      try {
        if (canal === "whatsapp" || canal === "ambos") {
          if (p.phone) {
            const phone = p.phone.replace(/\D/g, "");
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
            okWa++;
          } else if (canal === "whatsapp") fail++;
        }
        if (canal === "email" || canal === "ambos") {
          if (p.email) {
            const { data, error } = await supabase.functions.invoke("send-email", {
              body: { to: p.email, subject, text, fromName: proName },
            });
            if (error || (data as any)?.error) fail++; else okEmail++;
          } else if (canal === "email") fail++;
        }
      } catch { fail++; }
    }
    setSending(false);
    const parts: string[] = [];
    if (okWa) parts.push(`${okWa} WhatsApp aberto(s)`);
    if (okEmail) parts.push(`${okEmail} email(s) enviado(s)`);
    if (fail) parts.push(`${fail} falha(s)`);
    toast.success(parts.join(" · ") || "Concluído");
  };

  const copy = () => { navigator.clipboard.writeText(out); toast.success("Copiado"); };

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Motor de Conteúdo</h1>
      </header>
      <p className="text-xs text-muted-foreground">Gere mensagens prontas, escolha pacientes e envie por WhatsApp ou e-mail.</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Categoria</label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-[60vh]">{categorias.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Tom</label>
          <Select value={tom} onValueChange={setTom}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{tons.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Tamanho</label>
          <Select value={tamanho} onValueChange={setTamanho}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{tamanhos.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Canal</label>
          <Select value={canal} onValueChange={setCanal}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{canais.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <Input placeholder="Tema / contexto (opcional)" value={tema} onChange={(e) => setTema(e.target.value)} />

      {(canal === "email" || canal === "ambos") && (
        <Input placeholder="Assunto do e-mail" value={subject} onChange={(e) => setSubject(e.target.value)} />
      )}

      <Button onClick={generate} disabled={loading} className="w-full">
        <Sparkles className="h-4 w-4 mr-2" /> {loading ? "Gerando..." : "Gerar mensagem"}
      </Button>

      {out && (
        <Textarea value={out} onChange={(e) => setOut(e.target.value)} rows={8} />
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Pacientes</h2>
          {patients.length > 0 && (
            <button onClick={toggleAll} className="text-[11px] text-primary font-semibold">
              {selected.size === patients.length ? "Limpar" : "Selecionar todos"}
            </button>
          )}
        </div>
        {patients.length === 0 ? (
          <p className="text-xs text-muted-foreground">Você ainda não tem pacientes cadastrados.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1">
            {patients.map((p) => (
              <label key={p.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.full_name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {p.email || "sem email"} · {p.phone || "sem telefone"}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="text-[11px] text-muted-foreground">{selected.size} selecionado(s)</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={sendNow} disabled={sending || !out.trim() || selected.size === 0} className="bg-primary">
          {sending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> :
            canal === "email" ? <Mail className="h-4 w-4 mr-1" /> : <MessageCircle className="h-4 w-4 mr-1" />}
          Enviar agora
        </Button>
        <Button onClick={copy} variant="outline" disabled={!out}><Copy className="h-4 w-4 mr-1" /> Copiar</Button>
      </div>
    </div>
  );
};

export default Conteudo;

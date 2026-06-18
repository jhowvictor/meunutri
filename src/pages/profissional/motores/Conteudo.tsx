import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { callEngineAi, engineSystemPrompts } from "@/lib/engineAi";

const categorias = [
  { value: "educativa", label: "Educativa" },
  { value: "motivacional", label: "Motivacional" },
  { value: "reengajamento", label: "Reengajamento" },
  { value: "orientacao-diaria", label: "Orientação diária" },
  { value: "orientacao-semanal", label: "Orientação semanal" },
];

const Conteudo = () => {
  const [cat, setCat] = useState("educativa");
  const [tema, setTema] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const prompt = `Categoria: ${cat}. Tema/contexto: ${tema || "geral"}.\nGere 3 variações de mensagem curtas (máx 4 linhas cada), enumeradas (1, 2, 3), prontas para enviar a pacientes. Use {{nome}} e {{profissional}} como variáveis.`;
      const r = await callEngineAi(engineSystemPrompts.content, prompt, 800);
      setOut(r);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(out); toast.success("Copiado"); };

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3 pt-2">
        <Link to="/profissional/motores" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-xl font-extrabold">Motor de Conteúdo</h1>
      </header>
      <p className="text-xs text-muted-foreground">Gere mensagens prontas para enviar aos pacientes.</p>

      <div className="grid grid-cols-2 gap-2">
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{categorias.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Tema (opcional)" value={tema} onChange={(e) => setTema(e.target.value)} />
      </div>

      <Button onClick={generate} disabled={loading} className="w-full">
        <Sparkles className="h-4 w-4 mr-2" /> {loading ? "Gerando..." : "Gerar mensagens"}
      </Button>

      {out && (
        <div className="space-y-2">
          <Textarea value={out} onChange={(e) => setOut(e.target.value)} rows={12} />
          <Button onClick={copy} variant="secondary" className="w-full"><Copy className="h-4 w-4 mr-2" /> Copiar</Button>
        </div>
      )}
    </div>
  );
};

export default Conteudo;

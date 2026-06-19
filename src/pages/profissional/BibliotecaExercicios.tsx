import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Exercise {
  name: string;
  group: string;
  equipment: string;
  level: "iniciante" | "intermediário" | "avançado";
  description: string;
}

const EXERCISES: Exercise[] = [
  { name: "Agachamento livre", group: "Pernas", equipment: "Barra", level: "intermediário", description: "Pés afastados na largura dos ombros, descer mantendo a coluna neutra." },
  { name: "Agachamento com peso corporal", group: "Pernas", equipment: "Nenhum", level: "iniciante", description: "Versão sem carga, ideal para aprender o movimento." },
  { name: "Leg Press 45°", group: "Pernas", equipment: "Máquina", level: "iniciante", description: "Sentar-se na máquina, empurrar a plataforma com os pés." },
  { name: "Cadeira extensora", group: "Pernas", equipment: "Máquina", level: "iniciante", description: "Isolamento de quadríceps." },
  { name: "Stiff", group: "Posterior", equipment: "Barra", level: "intermediário", description: "Trabalha posterior de coxa e glúteos." },
  { name: "Supino reto", group: "Peito", equipment: "Barra", level: "intermediário", description: "Deitado no banco, descer a barra até o peito." },
  { name: "Crucifixo", group: "Peito", equipment: "Halteres", level: "intermediário", description: "Isolamento de peitoral." },
  { name: "Flexão de braço", group: "Peito", equipment: "Nenhum", level: "iniciante", description: "Flexão tradicional, manter o corpo alinhado." },
  { name: "Puxada frontal", group: "Costas", equipment: "Máquina", level: "iniciante", description: "Puxar a barra até a clavícula." },
  { name: "Remada curvada", group: "Costas", equipment: "Barra", level: "avançado", description: "Tronco inclinado, puxar a barra ao abdômen." },
  { name: "Barra fixa", group: "Costas", equipment: "Nenhum", level: "avançado", description: "Suspender o corpo com pegada pronada." },
  { name: "Desenvolvimento", group: "Ombros", equipment: "Halteres", level: "intermediário", description: "Empurrar halteres acima da cabeça." },
  { name: "Elevação lateral", group: "Ombros", equipment: "Halteres", level: "iniciante", description: "Elevar halteres lateralmente." },
  { name: "Rosca direta", group: "Braços", equipment: "Halteres", level: "iniciante", description: "Bíceps com cotovelos junto ao corpo." },
  { name: "Tríceps testa", group: "Braços", equipment: "Barra", level: "intermediário", description: "Deitado, descer a barra em direção à testa." },
  { name: "Prancha abdominal", group: "Core", equipment: "Nenhum", level: "iniciante", description: "Manter posição com cotovelos apoiados." },
  { name: "Abdominal supra", group: "Core", equipment: "Nenhum", level: "iniciante", description: "Flexão da coluna superior." },
  { name: "Burpee", group: "Cardio", equipment: "Nenhum", level: "avançado", description: "Combinação agachamento + flexão + salto." },
  { name: "Polichinelo", group: "Cardio", equipment: "Nenhum", level: "iniciante", description: "Saltos abrindo pernas e braços." },
  { name: "Corrida estacionária", group: "Cardio", equipment: "Nenhum", level: "iniciante", description: "Elevar joelhos no lugar." },
];

const groups = ["Todos", "Pernas", "Posterior", "Peito", "Costas", "Ombros", "Braços", "Core", "Cardio"];
const levels = ["Todos", "iniciante", "intermediário", "avançado"];

export default function BibliotecaExercicios() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("Todos");
  const [level, setLevel] = useState("Todos");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const filtered = useMemo(
    () =>
      EXERCISES.filter(
        (e) =>
          (group === "Todos" || e.group === group) &&
          (level === "Todos" || e.level === level) &&
          (q === "" || e.name.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, group, level]
  );

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/profissional">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Dumbbell className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Biblioteca de Exercícios</h1>
      </div>

      <Card className="p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercício..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {groups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ex) => (
          <Card
            key={ex.name}
            className="p-4 cursor-pointer hover:bg-accent/40 hover:border-primary/40 transition-colors"
            onClick={() => setSelected(ex)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold">{ex.name}</h3>
              <Badge variant="outline" className="text-xs capitalize">{ex.level}</Badge>
            </div>
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{ex.group}</Badge>
              <Badge variant="secondary" className="text-xs">{ex.equipment}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{ex.description}</p>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center py-8 text-muted-foreground">
            Nenhum exercício encontrado.
          </p>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary">{selected?.group}</Badge>
              <Badge variant="secondary">{selected?.equipment}</Badge>
              <Badge variant="outline" className="capitalize">{selected?.level}</Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Descrição</h4>
              <p className="text-muted-foreground">{selected?.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Sugestão de execução</h4>
              <p className="text-muted-foreground">
                3 a 4 séries de 10 a 12 repetições, com 60s de descanso entre séries. Ajuste a carga conforme o nível do paciente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Dicas técnicas</h4>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Mantenha a respiração controlada durante o movimento.</li>
                <li>Priorize a execução correta antes de aumentar a carga.</li>
                <li>Evite compensações com outras articulações.</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

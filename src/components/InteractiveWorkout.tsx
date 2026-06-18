import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw, Check, X, Timer, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  plan: string;
}

function parseExercises(plan: string): string[] {
  // Split by lines, keep ones that look like exercise items (start with -, *, number)
  return plan
    .split("\n")
    .map((l) => l.trim())
    .filter((l) =>
      /^([-*•]|\d+[\.\)])\s/.test(l) && l.length > 4 && l.length < 200
    )
    .slice(0, 30);
}

export default function InteractiveWorkout({ plan }: Props) {
  const exercises = useMemo(() => parseExercises(plan), [plan]);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(60);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          try {
            new AudioContext();
          } catch {}
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const startTimer = (s: number) => {
    setSeconds(s);
    setRemaining(s);
    setRunning(true);
  };

  const resetAll = () => {
    setDone(new Set());
    setRemaining(seconds);
    setRunning(false);
  };

  const progress = exercises.length ? (done.size / exercises.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={exercises.length === 0}>
          <Dumbbell className="h-4 w-4 mr-1" />
          Modo Treino
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modo Treino Interativo</DialogTitle>
        </DialogHeader>

        <Card className="p-4 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-muted-foreground">Progresso</div>
              <div className="text-2xl font-bold">
                {done.size} / {exercises.length}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={resetAll}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reiniciar
            </Button>
          </div>
          <Progress value={progress} />
        </Card>

        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="h-5 w-5 text-primary" />
            <span className="font-semibold">Cronômetro de descanso</span>
          </div>
          <div className="text-center text-5xl font-mono font-bold mb-3">
            {Math.floor(remaining / 60)
              .toString()
              .padStart(2, "0")}
            :{(remaining % 60).toString().padStart(2, "0")}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {[30, 60, 90, 120].map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => startTimer(s)}>
                {s}s
              </Button>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <Button size="sm" onClick={() => setRunning((r) => !r)} disabled={remaining === 0}>
              {running ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {running ? "Pausar" : "Iniciar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRemaining(seconds)}>
              <RotateCcw className="h-4 w-4 mr-1" /> Resetar
            </Button>
          </div>
        </Card>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground">Checklist</h3>
          {exercises.map((ex, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3",
                done.has(i)
                  ? "bg-primary/10 border-primary/40 line-through text-muted-foreground"
                  : "bg-card hover:bg-accent border-border"
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                  done.has(i) ? "bg-primary border-primary" : "border-muted-foreground"
                )}
              >
                {done.has(i) && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
              <span className="text-sm">{ex.replace(/^([-*•]|\d+[\.\)])\s/, "")}</span>
            </button>
          ))}
          {exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Não foi possível identificar exercícios no plano.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

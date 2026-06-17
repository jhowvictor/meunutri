
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Dumbbell,
  Scale,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SaveToLibrary from "@/components/SaveToLibrary";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Measurement {
  date: string;
  weight: number;
  bodyFat?: number;
  muscle?: number;
}

const initialData: Measurement[] = [
  { date: "Jan", weight: 81 },
  { date: "Fev", weight: 80 },
  { date: "Mar", weight: 78 },
  { date: "Abr", weight: 76.5 },
  { date: "Mai", weight: 74 },
  { date: "Jun", weight: 73 },
];

const EvolucaoCorporal = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>(initialData);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [form, setForm] = useState({ date: "", weight: "", bodyFat: "", muscle: "" });

  const latest = measurements[measurements.length - 1];
  const first = measurements[0];
  const weightDiff = latest && first ? (latest.weight - first.weight).toFixed(1) : "0";

  const handleRegister = () => {
    if (!form.date || !form.weight) {
      toast.error("Preencha pelo menos a data e o peso.");
      return;
    }
    const newMeasurement: Measurement = {
      date: form.date,
      weight: parseFloat(form.weight),
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
      muscle: form.muscle ? parseFloat(form.muscle) : undefined,
    };
    setMeasurements((prev) => [...prev, newMeasurement]);
    setForm({ date: "", weight: "", bodyFat: "", muscle: "" });
    setRegisterOpen(false);
    toast.success("Medição registrada com sucesso!");
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-primary" />
          Evolução Corporal
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={<Scale className="h-5 w-5" />} title="Peso Atual" value={`${latest.weight} kg`} trend={`${weightDiff} kg`} trendDirection={parseFloat(weightDiff) <= 0 ? "down" : "up"} />
        <MetricCard icon={<Activity className="h-5 w-5" />} title="IMC" value="22.5" trend="-0.7" trendDirection="down" />
        <MetricCard icon={<BarChart3 className="h-5 w-5" />} title="% Gordura" value="18.3%" trend="-1.2%" trendDirection="down" />
        <MetricCard icon={<Dumbbell className="h-5 w-5" />} title="Massa Muscular" value="31.2 kg" trend="+0.5 kg" trendDirection="up" />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Evolução do Peso</CardTitle>
          <CardDescription>Acompanhamento das suas medições</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={measurements} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`${value} kg`, "Peso"]}
                />
                <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorWeight)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard icon={<Scale className="h-6 w-6" />} title="Registrar nova medição" description="Atualize suas medidas corporais para acompanhar seu progresso" buttonText="Registrar" onClick={() => setRegisterOpen(true)} />
        <ActionCard icon={<BarChart3 className="h-6 w-6" />} title="Analisar progresso" description="Compare seus resultados e veja sua evolução detalhada" buttonText="Analisar" onClick={() => setAnalyzeOpen(true)} />
      </div>

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar nova medição</DialogTitle>
            <DialogDescription>Insira seus dados atuais para acompanhar sua evolução.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="date">Mês/Data</Label>
              <Input id="date" placeholder="Ex: Jul" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="Ex: 72.5" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFat">% Gordura (opcional)</Label>
              <Input id="bodyFat" type="number" step="0.1" placeholder="Ex: 18.3" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="muscle">Massa muscular (kg) (opcional)</Label>
              <Input id="muscle" type="number" step="0.1" placeholder="Ex: 31.2" value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>Cancelar</Button>
            <Button onClick={handleRegister}>Salvar medição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={analyzeOpen} onOpenChange={setAnalyzeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Análise do Progresso</DialogTitle>
            <DialogDescription>Resumo da sua evolução até o momento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p>📊 <strong>Total de medições:</strong> {measurements.length}</p>
            <p>⚖️ <strong>Peso inicial:</strong> {first.weight} kg ({first.date})</p>
            <p>⚖️ <strong>Peso atual:</strong> {latest.weight} kg ({latest.date})</p>
            <p>📉 <strong>Variação total:</strong> {weightDiff} kg</p>
            <p className="text-muted-foreground pt-2">
              {parseFloat(weightDiff) < 0
                ? "Excelente! Você está no caminho certo para seu objetivo. Continue mantendo a consistência!"
                : parseFloat(weightDiff) > 0
                ? "Houve aumento de peso. Avalie se está alinhado ao seu objetivo (ex: ganho de massa)."
                : "Seu peso está estável. Continue monitorando para identificar tendências."}
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <SaveToLibrary
              contentType="evolucao"
              title={`Análise de Progresso - ${latest.date}`}
              content={`Total de medições: ${measurements.length}\nPeso inicial: ${first.weight} kg (${first.date})\nPeso atual: ${latest.weight} kg (${latest.date})\nVariação total: ${weightDiff} kg`}
            />
            <Button onClick={() => setAnalyzeOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
}

const MetricCard = ({ icon, title, value, trend, trendDirection }: MetricCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-muted-foreground flex items-center">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded-full flex items-center ${trendDirection === "down" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </CardContent>
  </Card>
);

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

const ActionCard = ({ icon, title, description, buttonText, onClick }: ActionCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
    <CardFooter>
      <Button className="w-full flex items-center justify-between" onClick={onClick}>
        {buttonText}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </CardFooter>
  </Card>
);

export default EvolucaoCorporal;

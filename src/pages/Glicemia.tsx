import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Droplet, Plus, Loader2, Sparkles, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from "recharts";

interface Reading {
  id: string;
  value_mg_dl: number;
  reading_type: string;
  notes: string | null;
  measured_at: string;
}

const typeOptions = [
  { value: "jejum", label: "Jejum" },
  { value: "pos_refeicao", label: "Pós-refeição" },
  { value: "antes_dormir", label: "Antes de dormir" },
  { value: "aleatorio", label: "Aleatória" },
];
const typeShort: Record<string, string> = {
  jejum: "Jejum", pos_refeicao: "Pós-ref.", antes_dormir: "Noite", aleatorio: "Aleatória",
};

const Glicemia = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState("");
  const [type, setType] = useState("jejum");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("glucose_readings")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false })
      .limit(200);
    setReadings((data as Reading[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const save = async () => {
    if (!user) return;
    const v = parseFloat(value);
    if (!v || v < 20 || v > 800) {
      toast.error("Informe um valor válido (20–800 mg/dL)");
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("glucose_readings").insert({
      user_id: user.id,
      value_mg_dl: v,
      reading_type: type,
      notes: notes || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Registro salvo");
    setValue(""); setNotes("");
    load();
  };

  const analyze = async () => {
    if (readings.length === 0) {
      toast.error("Registre algumas medições primeiro");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("glucose-analysis", {
        body: { readings: readings.slice(0, 60) },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAnalysis((data as any).analysis);
    } catch (e: any) {
      toast.error(e.message || "Erro na análise");
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = period === "day" ? now - 24 * 3600 * 1000
      : period === "week" ? now - 7 * 24 * 3600 * 1000
      : now - 30 * 24 * 3600 * 1000;
    return readings
      .filter((r) => new Date(r.measured_at).getTime() >= cutoff)
      .slice()
      .reverse();
  }, [readings, period]);

  const chartData = filtered.map((r) => ({
    time: new Date(r.measured_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    value: r.value_mg_dl,
    type: r.reading_type,
  }));

  const stats = useMemo(() => {
    if (filtered.length === 0) return { avg: 0, max: 0, min: 0 };
    const vals = filtered.map((r) => r.value_mg_dl);
    return {
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      max: Math.max(...vals),
      min: Math.min(...vals),
    };
  }, [filtered]);

  const colorFor = (v: number) => v < 70 ? "text-blue-400" : v > 180 ? "text-rose-400" : v > 140 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="space-y-4 pb-4">
      <header className="flex items-center gap-3">
        <Link to="/" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-xl font-extrabold flex items-center gap-2">
            <Droplet className="h-5 w-5 text-rose-400" /> Controle Glicêmico
          </h1>
          <p className="text-[11px] text-muted-foreground">Registre, acompanhe e receba análises da IA</p>
        </div>
      </header>

      {/* Quick add */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div>
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Glicemia (mg/dL)</Label>
            <Input
              type="number" inputMode="numeric" placeholder="ex: 95"
              value={value} onChange={(e) => setValue(e.target.value)}
              className="text-2xl font-bold h-12"
            />
          </div>
          <div>
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Input placeholder="Observação (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={save} disabled={saving} className="w-full rounded-full bg-primary font-semibold">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Registrar agora
        </Button>
      </div>

      {/* Period tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="day">24h</TabsTrigger>
          <TabsTrigger value="week">7 dias</TabsTrigger>
          <TabsTrigger value="month">30 dias</TabsTrigger>
        </TabsList>
        <TabsContent value={period} className="mt-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Média" value={stats.avg} icon={Activity} />
            <Stat label="Máx" value={stats.max} icon={TrendingUp} />
            <Stat label="Mín" value={stats.min} icon={TrendingDown} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 h-64">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Sem dados nesse período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} hide={chartData.length > 12} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[40, "auto"]} />
                  <ReferenceArea y1={70} y2={140} fill="hsl(var(--primary))" fillOpacity={0.08} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Analysis */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">Análise IA</h3>
          </div>
          <Button size="sm" onClick={analyze} disabled={analyzing} variant="outline" className="rounded-full h-8 text-xs">
            {analyzing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {analysis ? "Atualizar" : "Analisar"}
          </Button>
        </div>
        {analysis ? (
          <p className="text-sm leading-relaxed whitespace-pre-line">{analysis}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Toque em "Analisar" para receber insights sobre seus padrões glicêmicos.</p>
        )}
      </div>

      {/* Recent list */}
      <div>
        <h3 className="text-sm font-bold mb-2">Recentes</h3>
        {loading ? (
          <div className="text-center py-4 text-xs text-muted-foreground">Carregando...</div>
        ) : readings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-muted-foreground">
            Nenhum registro ainda
          </div>
        ) : (
          <div className="space-y-2">
            {readings.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                <div className={`text-xl font-extrabold w-16 ${colorFor(r.value_mg_dl)}`}>{r.value_mg_dl}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{typeShort[r.reading_type] || r.reading_type}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(r.measured_at).toLocaleString("pt-BR")}
                    {r.notes ? ` • ${r.notes}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
    <Icon className="h-4 w-4 text-primary mb-1" />
    <div className="text-xl font-extrabold">{value || "—"}</div>
    <div className="text-[10px] text-muted-foreground">{label} mg/dL</div>
  </div>
);

export default Glicemia;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, LogOut, Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/components/AuthProvider";
import { useProfile, useAvatarUrl } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const goals = ["Perda de peso", "Ganho de massa", "Manutenção", "Melhorar saúde", "Performance esportiva"];
const activities = ["Sedentário", "Leve (1-3x/sem)", "Moderado (3-5x/sem)", "Intenso (5-6x/sem)", "Atleta"];
const restrictions = ["Lactose", "Glúten", "Frutos do mar", "Amendoim", "Ovos", "Vegano", "Vegetariano"];
const preferences = ["Mediterrânea", "Low carb", "Cetogênica", "Tradicional brasileira", "Asiática", "Vegana"];

const Perfil = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, update, reload } = useProfile();
  const avatarUrl = useAvatarUrl(profile?.avatar_url);

  const [form, setForm] = useState({
    full_name: "", age: "", sex: "", height_cm: "", weight_kg: "",
    target_weight_kg: "", main_goal: "", activity_level: "",
    dietary_restrictions: [] as string[], food_preferences: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        age: profile.age?.toString() || "",
        sex: profile.sex || "",
        height_cm: profile.height_cm?.toString() || "",
        weight_kg: profile.weight_kg?.toString() || "",
        target_weight_kg: profile.target_weight_kg?.toString() || "",
        main_goal: profile.main_goal || "",
        activity_level: profile.activity_level || "",
        dietary_restrictions: profile.dietary_restrictions || [],
        food_preferences: profile.food_preferences || [],
      });
    }
  }, [profile]);

  const toggleList = (key: "dietary_restrictions" | "food_preferences", v: string) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar foto");
    } else {
      await update({ avatar_url: path });
      toast.success("Foto atualizada!");
      reload();
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await update({
      full_name: form.full_name || null,
      age: form.age ? parseInt(form.age) : null,
      sex: form.sex || null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      target_weight_kg: form.target_weight_kg ? parseFloat(form.target_weight_kg) : null,
      main_goal: form.main_goal || null,
      activity_level: form.activity_level || null,
      dietary_restrictions: form.dietary_restrictions,
      food_preferences: form.food_preferences,
    });
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Perfil atualizado!");
  };

  const initial = (form.full_name || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-5 animate-[fadeIn_0.4s_ease-out]">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="glass rounded-3xl p-5 border border-white/10 flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20 border-2 border-primary neon-glow-sm">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">{initial}</AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center cursor-pointer neon-glow-sm">
            {uploading ? <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" /> : <Camera className="h-3.5 w-3.5 text-primary-foreground" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
          </label>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-lg truncate">{form.full_name || "Seu nome"}</div>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          {form.main_goal && <div className="mt-1.5 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">{form.main_goal}</div>}
        </div>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid grid-cols-3 w-full glass border border-white/10">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="prefs">Prefs</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-3 mt-4">
          <Field label="Nome completo"><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Idade"><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Field>
            <Field label="Sexo">
              <Select value={form.sex} onValueChange={(v) => setForm({ ...form, sex: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Altura (cm)"><Input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} /></Field>
            <Field label="Peso (kg)"><Input type="number" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></Field>
            <Field label="Meta (kg)"><Input type="number" step="0.1" value={form.target_weight_kg} onChange={(e) => setForm({ ...form, target_weight_kg: e.target.value })} /></Field>
          </div>
        </TabsContent>

        <TabsContent value="objetivos" className="space-y-3 mt-4">
          <Field label="Objetivo principal">
            <Select value={form.main_goal} onValueChange={(v) => setForm({ ...form, main_goal: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{goals.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Nível de atividade física">
            <Select value={form.activity_level} onValueChange={(v) => setForm({ ...form, activity_level: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{activities.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </TabsContent>

        <TabsContent value="prefs" className="space-y-4 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Restrições alimentares</Label>
            <div className="flex flex-wrap gap-2">
              {restrictions.map((r) => (
                <Chip key={r} active={form.dietary_restrictions.includes(r)} onClick={() => toggleList("dietary_restrictions", r)}>{r}</Chip>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Preferências alimentares</Label>
            <div className="flex flex-wrap gap-2">
              {preferences.map((p) => (
                <Chip key={p} active={form.food_preferences.includes(p)} onClick={() => toggleList("food_preferences", p)}>{p}</Chip>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} disabled={saving} className="w-full rounded-full bg-primary hover:bg-primary/90 neon-glow-sm font-semibold">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Salvar alterações
      </Button>

      <Button onClick={async () => { await signOut(); toast.success("Até logo!"); }} variant="outline" className="w-full rounded-full border-white/10">
        <LogOut className="h-4 w-4 mr-2" /> Sair da conta
      </Button>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
    {children}
  </div>
);

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-xs px-3 py-1.5 rounded-full border transition ${
      active
        ? "bg-primary/15 border-primary text-primary neon-glow-sm"
        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
    }`}
  >
    {children}
  </button>
);

export default Perfil;

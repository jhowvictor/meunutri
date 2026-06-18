import { useState } from "react";
import { Sparkles, ArrowRight, Camera, Loader2, Check, User, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const goals = ["Perda de peso", "Ganho de massa", "Manutenção", "Melhorar saúde", "Performance esportiva", "Controle glicêmico"];
const activities = ["Sedentário", "Leve (1-3x/sem)", "Moderado (3-5x/sem)", "Intenso (5-6x/sem)", "Atleta"];
const restrictions = ["Lactose", "Glúten", "Frutos do mar", "Amendoim", "Ovos", "Vegano", "Vegetariano"];
const preferences = ["Mediterrânea", "Low carb", "Cetogênica", "Tradicional brasileira", "Asiática", "Vegana"];
const specialties = ["Nutricionista", "Personal Trainer", "Nutrólogo", "Médico", "Educador Físico", "Outro"];

type AccountType = "pessoa" | "profissional" | "";

const Onboarding = () => {
  const { user } = useAuth();
  const { update } = useProfile();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState({
    full_name: "", age: "", sex: "", height_cm: "", weight_kg: "", target_weight_kg: "",
    main_goal: "", activity_level: "",
    dietary_restrictions: [] as string[], food_preferences: [] as string[],
    // pro
    display_name: "", registration_number: "", specialty: "", whatsapp: "", bio: "",
  });

  const isPro = accountType === "profissional";
  const total = isPro ? 4 : 5; // pro: type, basic, pro-info, done | pessoa: type, basic, goal, prefs, done
  const progress = ((step + 1) / total) * 100;

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setAvatarPreview(URL.createObjectURL(file));
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) toast.error("Erro ao enviar");
    else setAvatarPath(path);
    setUploading(false);
  };

  const toggle = (key: "dietary_restrictions" | "food_preferences", v: string) => {
    setData((d) => ({ ...d, [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] }));
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const profilePatch: any = {
      full_name: data.full_name || null,
      account_type: accountType || "pessoa",
      avatar_url: avatarPath,
      onboarding_completed: true,
    };
    if (!isPro) {
      Object.assign(profilePatch, {
        age: data.age ? parseInt(data.age) : null,
        sex: data.sex || null,
        height_cm: data.height_cm ? parseFloat(data.height_cm) : null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        target_weight_kg: data.target_weight_kg ? parseFloat(data.target_weight_kg) : null,
        main_goal: data.main_goal || null,
        activity_level: data.activity_level || null,
        dietary_restrictions: data.dietary_restrictions,
        food_preferences: data.food_preferences,
      });
    }
    const { error } = await update(profilePatch);
    if (error) {
      setSaving(false);
      toast.error("Erro ao salvar perfil: " + error.message);
      return;
    }

    if (isPro) {
      const { error: proErr } = await (supabase as any).from("professional_profiles").upsert({
        id: user.id,
        display_name: data.display_name || data.full_name || null,
        registration_number: data.registration_number || null,
        specialty: data.specialty || null,
        whatsapp: data.whatsapp || null,
        bio: data.bio || null,
        logo_url: avatarPath,
      });
      if (proErr) {
        setSaving(false);
        toast.error("Erro ao salvar dados profissionais: " + proErr.message);
        return;
      }
    }

    setSaving(false);
    toast.success("Tudo pronto! Bem-vindo ao MeuNutri.AI");
    window.location.href = isPro ? "/profissional" : "/";
  };

  const initial = (data.full_name || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 py-8 max-w-md mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Passo {step + 1} de {total}</span>
          <span className="text-xs text-primary font-semibold">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="flex-1 space-y-5">
        {/* STEP 0 - Account type */}
        {step === 0 && (
          <div className="space-y-5 animate-[fadeIn_0.4s]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-3">
                <Sparkles className="h-3 w-3 text-primary" /><span className="text-[11px] font-medium text-primary">Bem-vindo</span>
              </div>
              <h1 className="text-3xl font-extrabold">Como você vai usar?</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Escolha o tipo de conta para personalizar sua experiência</p>
            </div>

            <button
              onClick={() => setAccountType("pessoa")}
              className={`w-full text-left p-5 rounded-2xl border-2 transition ${
                accountType === "pessoa" ? "bg-primary/15 border-primary neon-glow-sm" : "bg-white/5 border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">Pessoa {accountType === "pessoa" && <Check className="h-4 w-4 text-primary" />}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">Emagrecer, ganhar massa, melhorar saúde, dietas, treinos e receitas personalizadas para você.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAccountType("profissional")}
              className={`w-full text-left p-5 rounded-2xl border-2 transition ${
                accountType === "profissional" ? "bg-primary/15 border-primary neon-glow-sm" : "bg-white/5 border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-2">
                    Profissional de Saúde {accountType === "profissional" && <Check className="h-4 w-4 text-primary" />}
                    <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary rounded-full px-2 py-0.5">B2B</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Nutricionistas, personal trainers e médicos. Gerencie pacientes, envie planos, acompanhe evolução.</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* STEP 1 - Basic info (both) */}
        {step === 1 && (
          <div className="space-y-5 animate-[fadeIn_0.4s]">
            <div>
              <h1 className="text-3xl font-extrabold">Vamos te conhecer</h1>
              <p className="text-sm text-muted-foreground mt-1.5">{isPro ? "Seus dados básicos" : "Dados pessoais"}</p>
            </div>
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-primary neon-glow-sm">
                  <AvatarImage src={avatarPreview ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">{initial}</AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer neon-glow-sm">
                  {uploading ? <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" /> : <Camera className="h-4 w-4 text-primary-foreground" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
                </label>
              </div>
              <span className="text-xs text-muted-foreground">{isPro ? "Logotipo ou foto" : "Sua foto (opcional)"}</span>
            </div>
            <Input placeholder="Nome completo" value={data.full_name} onChange={(e) => setData({ ...data, full_name: e.target.value })} />
            {!isPro && (
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Idade" value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} />
                <Select value={data.sex} onValueChange={(v) => setData({ ...data, sex: v })}>
                  <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
                  <SelectContent><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Feminino">Feminino</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* PRO step 2 - Professional info */}
        {step === 2 && isPro && (
          <div className="space-y-4 animate-[fadeIn_0.4s]">
            <div>
              <h1 className="text-3xl font-extrabold">Dados <span className="text-primary">profissionais</span></h1>
              <p className="text-sm text-muted-foreground mt-1.5">Esses dados aparecerão em PDFs e mensagens enviadas aos pacientes</p>
            </div>
            <Input placeholder="Nome de exibição (ex: Dra. Carla Martins)" value={data.display_name} onChange={(e) => setData({ ...data, display_name: e.target.value })} />
            <Select value={data.specialty} onValueChange={(v) => setData({ ...data, specialty: v })}>
              <SelectTrigger><SelectValue placeholder="Especialidade" /></SelectTrigger>
              <SelectContent>{specialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Registro profissional (ex: CRN-3 12345)" value={data.registration_number} onChange={(e) => setData({ ...data, registration_number: e.target.value })} />
            <Input placeholder="WhatsApp profissional" value={data.whatsapp} onChange={(e) => setData({ ...data, whatsapp: e.target.value })} />
            <Input placeholder="Bio curta (opcional)" value={data.bio} onChange={(e) => setData({ ...data, bio: e.target.value })} />
          </div>
        )}

        {/* PESSOA step 2 - goal */}
        {step === 2 && !isPro && (
          <div className="space-y-5 animate-[fadeIn_0.4s]">
            <div>
              <h1 className="text-3xl font-extrabold">Qual seu <span className="text-primary">objetivo</span>?</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Vamos personalizar tudo para você</p>
            </div>
            <div className="space-y-2">
              {goals.map((g) => (
                <button key={g} onClick={() => setData({ ...data, main_goal: g })}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    data.main_goal === g ? "bg-primary/15 border-primary neon-glow-sm" : "bg-white/5 border-white/10 hover:border-white/30"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{g}</span>
                    {data.main_goal === g && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Field label="Altura (cm)"><Input type="number" value={data.height_cm} onChange={(e) => setData({ ...data, height_cm: e.target.value })} /></Field>
              <Field label="Peso (kg)"><Input type="number" step="0.1" value={data.weight_kg} onChange={(e) => setData({ ...data, weight_kg: e.target.value })} /></Field>
              <Field label="Meta (kg)"><Input type="number" step="0.1" value={data.target_weight_kg} onChange={(e) => setData({ ...data, target_weight_kg: e.target.value })} /></Field>
            </div>
          </div>
        )}

        {/* PESSOA step 3 - prefs + activity */}
        {step === 3 && !isPro && (
          <div className="space-y-5 animate-[fadeIn_0.4s]">
            <div>
              <h1 className="text-3xl font-extrabold">Suas <span className="text-primary">preferências</span></h1>
              <p className="text-sm text-muted-foreground mt-1.5">Selecione o que combina com você</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Restrições alimentares</Label>
              <div className="flex flex-wrap gap-2">
                {restrictions.map((r) => <Chip key={r} active={data.dietary_restrictions.includes(r)} onClick={() => toggle("dietary_restrictions", r)}>{r}</Chip>)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Estilo alimentar</Label>
              <div className="flex flex-wrap gap-2">
                {preferences.map((p) => <Chip key={p} active={data.food_preferences.includes(p)} onClick={() => toggle("food_preferences", p)}>{p}</Chip>)}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Nível de atividade</Label>
              <div className="grid grid-cols-1 gap-2">
                {activities.map((a) => (
                  <button key={a} onClick={() => setData({ ...data, activity_level: a })}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition ${
                      data.activity_level === a ? "bg-primary/15 border-primary text-primary" : "bg-white/5 border-white/10"
                    }`}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DONE step (last) */}
        {step === total - 1 && (
          <div className="space-y-6 animate-[fadeIn_0.4s] text-center pt-8">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/15 border border-primary flex items-center justify-center pulse-glow">
              <Check className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Tudo pronto, {(data.display_name || data.full_name).split(" ")[0] || "campeão"}! 🎉</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                {isPro
                  ? "Seu painel profissional está pronto. Adicione seus pacientes e comece a enviar planos."
                  : "Suas receitas, dietas e treinos serão personalizados de acordo com seus objetivos."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-full border-white/10">Voltar</Button>
        )}
        {step < total - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && !accountType}
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 neon-glow-sm font-semibold"
          >
            Continuar <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button onClick={finish} disabled={saving} className="flex-1 rounded-full bg-primary hover:bg-primary/90 neon-glow-sm font-semibold">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Começar minha jornada
          </Button>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-[10px] text-muted-foreground mb-1 block">{label}</Label>
    {children}
  </div>
);
const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick}
    className={`text-xs px-3 py-1.5 rounded-full border transition ${
      active ? "bg-primary/15 border-primary text-primary neon-glow-sm" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
    }`}>{children}</button>
);

export default Onboarding;

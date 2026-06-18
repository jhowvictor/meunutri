import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Utensils, Camera, Calendar, BookOpen, TrendingUp, ShoppingCart, Dumbbell,
  Library, Sparkles, ArrowRight, Clock, Heart, ChefHat, Target, Flame
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import heroFood from "@/assets/hero-food.jpg";


const tools = [
  { to: "/receita-personalizada", label: "Receitas", desc: "Personalizadas", icon: Utensils, accent: "from-rose-500/20 to-rose-500/5", iconColor: "text-rose-400" },
  { to: "/dieta-personalizada", label: "Dietas", desc: "Sob medida", icon: Calendar, accent: "from-emerald-500/25 to-emerald-500/5", iconColor: "text-emerald-400" },
  { to: "/montar-treino", label: "Treinos", desc: "Personalizados", icon: Dumbbell, accent: "from-amber-500/25 to-amber-500/5", iconColor: "text-amber-400" },
  { to: "/ebook-personalizado", label: "E-books", desc: "Nutricionais", icon: BookOpen, accent: "from-indigo-500/25 to-indigo-500/5", iconColor: "text-indigo-400" },
  { to: "/evolucao-corporal", label: "Evolução", desc: "Corporal", icon: TrendingUp, accent: "from-cyan-500/25 to-cyan-500/5", iconColor: "text-cyan-400" },
  { to: "/analisar-refeicao", label: "Analisar", desc: "Refeição", icon: Camera, accent: "from-fuchsia-500/25 to-fuchsia-500/5", iconColor: "text-fuchsia-400" },
  { to: "/lista-compras", label: "Compras", desc: "Inteligente", icon: ShoppingCart, accent: "from-orange-500/25 to-orange-500/5", iconColor: "text-orange-400" },
  { to: "/minha-biblioteca", label: "Biblioteca", desc: "Seus salvos", icon: Library, accent: "from-primary/30 to-primary/5", iconColor: "text-primary" },
];

const typeLabel: Record<string, string> = {
  receita: "Receita",
  dieta: "Dieta",
  treino: "Treino",
  ebook: "E-book",
  lista_compras: "Lista",
  analise_refeicao: "Análise",
  evolucao: "Evolução",
  mini_chef: "Mini Chef",
};

const typeColor: Record<string, string> = {
  receita: "bg-rose-500/90",
  dieta: "bg-emerald-500/90",
  treino: "bg-amber-500/90",
  ebook: "bg-indigo-500/90",
  lista_compras: "bg-orange-500/90",
  analise_refeicao: "bg-fuchsia-500/90",
  evolucao: "bg-cyan-500/90",
  mini_chef: "bg-primary",
};

const timeAgo = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `há ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString("pt-BR");
};

interface LibItem {
  id: string;
  title: string;
  content_type: string;
  created_at: string;
  is_favorite: boolean;
}

const PremiumIndex = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [recent, setRecent] = useState<LibItem[]>([]);
  const [favorites, setFavorites] = useState<LibItem[]>([]);
  const [streak, setStreak] = useState(0);

  if (profile?.account_type === "profissional") {
    return <Navigate to="/profissional" replace />;
  }


  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: r }, { data: f }] = await Promise.all([
        supabase.from("library_items").select("id,title,content_type,created_at,is_favorite").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
        supabase.from("library_items").select("id,title,content_type,created_at,is_favorite").eq("user_id", user.id).eq("is_favorite", true).order("updated_at", { ascending: false }).limit(6),
      ]);
      setRecent(r || []);
      setFavorites(f || []);
      setStreak(profile?.streak_days ?? Math.max(1, Math.min(7, (r || []).length)));
    })();
  }, [user, profile]);

  const firstName = profile?.full_name?.split(" ")[0] || "você";
  const goalText = profile?.target_weight_kg && profile?.weight_kg
    ? `Vamos continuar sua jornada${profile.target_weight_kg < profile.weight_kg ? ` para perder ${(profile.weight_kg - profile.target_weight_kg).toFixed(0)} kg` : profile.target_weight_kg > profile.weight_kg ? ` de ganho de massa` : ""}`
    : "Sua melhor versão começa com escolhas inteligentes";

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl glass border border-white/10 px-5 py-6 mt-3">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative grid grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-3">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">Inteligência que transforma</span>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
              Olá, <span className="text-primary">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-snug">{goalText}</p>
          </div>
          <div className="relative h-24 w-24 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-primary/30 orbit-slow" />
            <img src={heroFood} alt="" className="relative h-24 w-24 rounded-full object-cover border-2 border-primary/40 neon-glow-sm" />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Link to="/receita-personalizada" className="flex-1">
            <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-sm font-semibold">
              <Sparkles className="h-4 w-4 mr-1.5" /> Criar agora
            </Button>
          </Link>
          <Link to="/perfil">
            <Button variant="outline" className="rounded-full border-white/10 bg-white/5">
              <Target className="h-4 w-4 mr-1.5" /> Meta
            </Button>
          </Link>
        </div>
      </section>

      {/* DASHBOARD MINI */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="glass rounded-2xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mb-1">
            <Flame className="h-3 w-3 text-orange-400" /> Sequência
          </div>
          <div className="text-xl font-bold">{streak}<span className="text-xs text-muted-foreground ml-1">dias</span></div>
        </div>
        <div className="glass rounded-2xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mb-1">
            <TrendingUp className="h-3 w-3 text-primary" /> Peso
          </div>
          <div className="text-xl font-bold">{profile?.weight_kg ?? "--"}<span className="text-xs text-muted-foreground ml-1">kg</span></div>
        </div>
        <div className="glass rounded-2xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] mb-1">
            <Target className="h-3 w-3 text-emerald-400" /> Meta
          </div>
          <div className="text-xl font-bold">{profile?.target_weight_kg ?? "--"}<span className="text-xs text-muted-foreground ml-1">kg</span></div>
        </div>
      </section>

      {/* TOOLS */}
      <section>
        <div className="flex items-baseline justify-between mb-3 px-1">
          <h2 className="text-lg font-bold">O que você deseja <span className="text-primary">criar</span> hoje?</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <div className={`relative glass rounded-2xl p-4 border border-white/5 card-hover overflow-hidden h-full`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${t.accent} opacity-60 pointer-events-none`} />
                <div className="relative">
                  <div className="inline-flex p-2 rounded-xl bg-background/40 border border-white/10 mb-3">
                    <t.icon className={`h-5 w-5 ${t.iconColor}`} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{t.label}</div>
                      <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CONTINUE */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-lg font-bold">Continue de onde parou</h2>
            <Link to="/minha-biblioteca" className="text-xs font-medium text-primary">Ver todos</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hidden -mx-4 px-4 snap-x">
            {recent.map((item) => (
              <Link to="/minha-biblioteca" key={item.id} className="shrink-0 w-44 snap-start">
                <div className="glass rounded-2xl p-3 border border-white/5 card-hover h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${typeColor[item.content_type] || "bg-primary"}`}>
                      {typeLabel[item.content_type] || item.content_type}
                    </span>
                    {item.is_favorite && <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />}
                  </div>
                  <div className="h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mb-2 flex items-center justify-center border border-white/5">
                    <ChefHat className="h-8 w-8 text-primary/60" />
                  </div>
                  <div className="font-semibold text-xs leading-snug line-clamp-2 min-h-[2.2rem]">{item.title}</div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {timeAgo(item.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAVORITES */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-lg font-bold">Seus favoritos</h2>
            <Link to="/favoritos" className="text-xs font-medium text-primary">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {favorites.slice(0, 4).map((item) => (
              <Link to="/favoritos" key={item.id}>
                <div className="glass rounded-2xl p-3 border border-white/5 card-hover flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${typeColor[item.content_type] || "bg-primary"}`}>
                    {(typeLabel[item.content_type] || "X").charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.title}</div>
                    <div className="text-[11px] text-muted-foreground">{typeLabel[item.content_type]}</div>
                  </div>
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PremiumIndex;

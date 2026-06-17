import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, ChefHat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Item {
  id: string;
  title: string;
  content: string;
  content_type: string;
  created_at: string;
}

const labels: Record<string, string> = {
  receita: "Receitas", dieta: "Dietas", treino: "Treinos",
  ebook: "E-books", lista_compras: "Listas", analise_refeicao: "Análises",
  evolucao: "Evolução", mini_chef: "Mini Chef",
};

const Favoritos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<string>("todos");
  const [open, setOpen] = useState<Item | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("library_items").select("*").eq("user_id", user.id).eq("is_favorite", true).order("updated_at", { ascending: false })
      .then(({ data }) => setItems((data as Item[]) || []));
  }, [user]);

  const filtered = filter === "todos" ? items : items.filter((i) => i.content_type === filter);
  const types = Array.from(new Set(items.map((i) => i.content_type)));

  return (
    <div className="space-y-5 animate-[fadeIn_0.4s]">
      <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Heart className="h-6 w-6 fill-rose-500 text-rose-500" /> Seus favoritos
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Conteúdos que você marcou como favoritos</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hidden -mx-4 px-4">
        <FilterChip active={filter === "todos"} onClick={() => setFilter("todos")}>Todos</FilterChip>
        {types.map((t) => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>{labels[t] || t}</FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center border border-white/5">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum favorito ainda. Marque conteúdos com ❤️ para vê-los aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <button key={item.id} onClick={() => setOpen(item)} className="w-full text-left">
              <div className="glass rounded-2xl p-3 border border-white/5 card-hover flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{item.title}</div>
                  <div className="text-[11px] text-muted-foreground">{labels[item.content_type] || item.content_type}</div>
                </div>
                <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-auto bg-white text-black">
          <DialogHeader><DialogTitle className="text-black">{open?.title}</DialogTitle></DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-black">{open?.content}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FilterChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}
    className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
      active ? "bg-primary/15 border-primary text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
    }`}>{children}</button>
);

export default Favoritos;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChefHat,
  Dumbbell,
  Heart,
  Library,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  Utensils,
  Camera,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

type LibraryItem = {
  id: string;
  content_type: string;
  title: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

const TYPE_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  receita: { label: "Receita", icon: Utensils },
  dieta: { label: "Dieta", icon: ChefHat },
  treino: { label: "Treino", icon: Dumbbell },
  ebook: { label: "E-book", icon: BookOpen },
  lista_compras: { label: "Lista de Compras", icon: ShoppingCart },
  analise_refeicao: { label: "Análise", icon: Camera },
  evolucao: { label: "Evolução", icon: TrendingUp },
  mini_chef: { label: "Mini Chef", icon: ChefHat },
};

const TABS: { value: string; label: string; emoji: string }[] = [
  { value: "all", label: "Todos", emoji: "📚" },
  { value: "favoritos", label: "Favoritos", emoji: "⭐" },
  { value: "receita", label: "Receitas", emoji: "📖" },
  { value: "dieta", label: "Dietas", emoji: "🥗" },
  { value: "treino", label: "Treinos", emoji: "💪" },
  { value: "ebook", label: "E-books", emoji: "📚" },
  { value: "mini_chef", label: "Mini Chef", emoji: "🤖" },
];

const MinhaBiblioteca = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest">("recent");
  const [selected, setSelected] = useState<LibraryItem | null>(null);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("library_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar biblioteca.");
    } else {
      setItems((data as LibraryItem[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleFavorite = async (item: LibraryItem) => {
    const { error } = await supabase
      .from("library_items")
      .update({ is_favorite: !item.is_favorite })
      .eq("id", item.id);
    if (error) {
      toast.error("Não foi possível atualizar favorito.");
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i))
    );
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este conteúdo?")) return;
    const { error } = await supabase.from("library_items").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected(null);
    toast.success("Conteúdo excluído.");
  };

  const filtered = useMemo(() => {
    let list = items;
    if (tab === "favoritos") list = list.filter((i) => i.is_favorite);
    else if (tab !== "all") list = list.filter((i) => i.content_type === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.content.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === "recent" ? db - da : da - db;
    });
    return list;
  }, [items, tab, search, sort]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8">
      <div className="container max-w-6xl px-4 mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center text-primary">
            <Library className="h-7 w-7 mr-2" />
            Minha Biblioteca
          </h1>
        </div>

        <Card className="p-4 md:p-6 mb-6 bg-card/70 backdrop-blur-sm border-border/40 shadow-[0_0_30px_hsl(var(--primary)/0.08)]">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar conteúdos salvos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as "recent" | "oldest")}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recente</SelectItem>
                <SelectItem value="oldest">Mais antigo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-muted/40 p-1">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="text-sm">
                <span className="mr-1">{t.emoji}</span>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Library className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Nenhum conteúdo salvo ainda.</p>
                <p className="text-sm mt-1">
                  Use o botão "Salvar na Biblioteca" nos conteúdos gerados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => {
                  const meta = TYPE_META[item.content_type] ?? {
                    label: item.content_type,
                    icon: Library,
                  };
                  const Icon = meta.icon;
                  return (
                    <Card
                      key={item.id}
                      className="group p-4 bg-card/80 backdrop-blur-sm border-border/40 hover:border-primary/60 hover:shadow-[0_0_20px_hsl(var(--primary)/0.25)] transition-all cursor-pointer"
                      onClick={() => setSelected(item)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">
                            {meta.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item);
                          }}
                          className="text-primary hover:scale-110 transition-transform"
                          aria-label="Favoritar"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              item.is_favorite ? "fill-primary" : ""
                            }`}
                          />
                        </button>
                      </div>
                      <h3 className="font-semibold text-base line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-3">
                        {new Date(item.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="pr-8">{selected?.title}</DialogTitle>
          </DialogHeader>
          <div className="bg-white text-black p-5 rounded-lg overflow-y-auto flex-1">
            <pre className="whitespace-pre-wrap font-sans text-sm text-black">
              {selected?.content}
            </pre>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => selected && toggleFavorite(selected)}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${
                  selected?.is_favorite ? "fill-current text-primary" : ""
                }`}
              />
              {selected?.is_favorite ? "Favoritado" : "Favoritar"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selected && deleteItem(selected.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinhaBiblioteca;

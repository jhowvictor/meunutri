
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star, Search, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ui/sonner";

interface Recipe {
  id: string;
  title: string;
  time: string | null;
  calories: string | null;
  portions: string | null;
  diet_type: string | null;
  meal_type: string | null;
  created_at: string;
}

const ReceitasFavoritas = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Buscar receitas favoritas
  useEffect(() => {
    if (user) {
      fetchFavoriteRecipes();
    }
  }, [user]);

  // Filtrar receitas com base na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecipes(recipes);
      return;
    }

    const filtered = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredRecipes(filtered);
  }, [searchTerm, recipes]);

  // Buscar receitas favoritas do usuário
  const fetchFavoriteRecipes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, time, calories, portions, diet_type, meal_type, created_at')
        .eq('user_id', user?.id)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (error) {
      console.error("Erro ao buscar receitas favoritas:", error);
      toast.error("Não foi possível carregar suas receitas favoritas");
    } finally {
      setIsLoading(false);
    }
  };

  // Remover dos favoritos
  const handleRemoveFavorite = async (id: string) => {
    try {
      setRemovingId(id);
      
      const { error } = await supabase
        .from('recipes')
        .update({ is_favorite: false })
        .eq('id', id);
        
      if (error) throw error;
      
      // Atualizar a lista removendo a receita
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      toast.success("Receita removida dos favoritos");
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Não foi possível remover a receita dos favoritos");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30 py-8">
      <div className="container max-w-4xl px-4">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Star className="h-6 w-6 mr-2 text-yellow-400 fill-yellow-400" />
            Minhas Receitas Favoritas
          </h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar receitas..."
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="h-32 bg-primary/10 flex items-center justify-center">
                    <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/receita/${recipe.id}`} className="hover:text-primary">
                      <CardTitle className="text-lg mb-2 hover:underline">
                        {recipe.title}
                      </CardTitle>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => handleRemoveFavorite(recipe.id)}
                      disabled={removingId === recipe.id}
                    >
                      {removingId === recipe.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{recipe.meal_type || "Refeição"} • {recipe.diet_type || "Tipo padrão"}</p>
                    <div className="flex gap-2 mt-1">
                      {recipe.time && <span>{recipe.time}</span>}
                      {recipe.calories && <span>• {recipe.calories}</span>}
                      {recipe.portions && (
                        <span>• {recipe.portions} {parseInt(recipe.portions) === 1 ? 'porção' : 'porções'}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <Star className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma receita favorita encontrada</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm 
                ? "Tente uma busca diferente" 
                : "Marque receitas como favoritas para vê-las aqui"}
            </p>
            <Link to="/">
              <Button className="mt-4">Voltar ao início</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceitasFavoritas;

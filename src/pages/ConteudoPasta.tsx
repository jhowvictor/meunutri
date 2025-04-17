
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Folder, Search, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
  folder_recipe_id: string;
}

interface Folder {
  id: string;
  name: string;
}

const ConteudoPasta = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [folder, setFolder] = useState<Folder | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recipeToRemove, setRecipeToRemove] = useState<Recipe | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Buscar detalhes da pasta e suas receitas
  useEffect(() => {
    if (user && folderId) {
      fetchFolderDetails();
      fetchFolderRecipes();
    }
  }, [user, folderId]);

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

  // Buscar detalhes da pasta
  const fetchFolderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('id, name')
        .eq('id', folderId)
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      if (!data) {
        toast.error("Pasta não encontrada");
        navigate('/minhas-pastas');
        return;
      }
      
      setFolder(data);
    } catch (error) {
      console.error("Erro ao buscar detalhes da pasta:", error);
      toast.error("Não foi possível carregar os detalhes da pasta");
      navigate('/minhas-pastas');
    }
  };

  // Buscar receitas na pasta
  const fetchFolderRecipes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('folder_recipes')
        .select(`
          id,
          recipe_id,
          recipes:recipe_id (
            id, title, time, calories, portions, diet_type, meal_type, created_at
          )
        `)
        .eq('folder_id', folderId);
        
      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      const formattedRecipes = data
        .filter(item => item.recipes) // Garantir que a receita existe
        .map(item => ({
          ...item.recipes,
          folder_recipe_id: item.id
        }));
      
      setRecipes(formattedRecipes);
      setFilteredRecipes(formattedRecipes);
    } catch (error) {
      console.error("Erro ao buscar receitas da pasta:", error);
      toast.error("Não foi possível carregar as receitas desta pasta");
    } finally {
      setIsLoading(false);
    }
  };

  // Manipuladores para remoção de receita da pasta
  const handleRemovePrompt = (recipe: Recipe) => {
    setRecipeToRemove(recipe);
    setShowDeleteDialog(true);
  };

  const handleRemoveFromFolder = async () => {
    if (!recipeToRemove) return;
    
    try {
      setRemovingId(recipeToRemove.folder_recipe_id);
      
      const { error } = await supabase
        .from('folder_recipes')
        .delete()
        .eq('id', recipeToRemove.folder_recipe_id);
        
      if (error) throw error;
      
      setRecipes(prev => prev.filter(r => r.folder_recipe_id !== recipeToRemove.folder_recipe_id));
      toast.success("Receita removida da pasta");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Erro ao remover receita da pasta:", error);
      toast.error("Não foi possível remover a receita da pasta");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30 py-8">
      <div className="container max-w-4xl px-4">
        <div className="flex items-center mb-8">
          <Link to="/minhas-pastas">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Folder className="h-6 w-6 mr-2 text-primary" />
            {folder ? folder.name : 'Carregando pasta...'}
          </h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar receitas nesta pasta..."
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
                    <Folder className="h-10 w-10 text-primary" />
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
                      onClick={() => handleRemovePrompt(recipe)}
                      disabled={removingId === recipe.folder_recipe_id}
                    >
                      {removingId === recipe.folder_recipe_id ? (
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
              <Folder className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma receita nesta pasta</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm 
                ? "Tente uma busca diferente" 
                : "Adicione receitas a esta pasta para vê-las aqui"}
            </p>
            <Link to="/">
              <Button className="mt-4">Voltar ao início</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Confirmação de remoção de receita */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover receita da pasta?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover a receita "{recipeToRemove?.title}" desta pasta?
              <br /><br />
              A receita não será excluída, apenas removida desta pasta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingId !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromFolder}
              disabled={removingId !== null}
              className="bg-red-600 hover:bg-red-700"
            >
              {removingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConteudoPasta;

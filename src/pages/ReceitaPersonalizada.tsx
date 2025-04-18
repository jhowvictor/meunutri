import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Utensils, 
  Carrot, 
  Clock, 
  Flame, 
  Check,
  Loader2,
  Star,
  Folder,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

const ReceitaPersonalizada = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tipoAlimentacao: "",
    refeicaoDesejada: "",
    restricoesAlimentares: "",
    ingredientesDisponiveis: "",
    objetivoAlimentar: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receitaGerada, setReceitaGerada] = useState({
    id: "",
    titulo: "",
    tempo: "",
    calorias: "",
    descricao: "",
    isFavorite: false
  });
  
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [userFolders, setUserFolders] = useState<{id: string, name: string}[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (showFolderDialog && user) {
      fetchUserFolders();
    }
  }, [showFolderDialog, user]);

  const fetchUserFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');
        
      if (error) throw error;
      setUserFolders(data || []);
    } catch (error) {
      console.error("Erro ao buscar pastas:", error);
      toast.error("Não foi possível carregar suas pastas");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openAIService.getApiKey()) {
      toast.error("Por favor, configure sua chave da API OpenAI primeiro.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const prompt = `
        Por favor, crie uma receita personalizada com base nas seguintes características:
        
        Tipo de Alimentação: ${formData.tipoAlimentacao}
        Refeição: ${formData.refeicaoDesejada}
        Restrições Alimentares: ${formData.restricoesAlimentares || "Nenhuma"}
        Ingredientes Disponíveis: ${formData.ingredientesDisponiveis || "Sem preferência específica"}
        Objetivo Alimentar: ${formData.objetivoAlimentar}
        
        Forneça o nome da receita, ingredientes com medidas, modo de preparo passo a passo, valor calórico, macronutrientes, e dicas extras ou substituições.
        IMPORTANTE: O nome da receita deve começar com "Nome da Receita: " para facilitar a extração.
      `;
      
      console.log("Enviando solicitação para gerar receita...");
      const result = await openAIService.generateContent({ prompt });
      console.log("Resposta recebida:", result.isError ? "Erro" : "Sucesso");
      
      if (!result.isError && result.content) {
        let titulo = "Nova Receita Personalizada";
        
        const padroesTitulo = [
          /(?:Nome da [Rr]eceita|Título):\s*([^\n]+)/i,
          /^\s*#\s*([^\n]+)/m,
          /^\s*([^\n:]+)(?:\n|$)/m,
        ];
        
        for (const padrao of padroesTitulo) {
          const match = result.content.match(padrao);
          if (match && match[1]?.trim()) {
            titulo = match[1].trim();
            break;
          }
        }
        
        console.log("Título extraído:", titulo);
        console.log("Conteúdo completo:", result.content.substring(0, 100) + "...");
        
        let recipeId = "";
        if (user) {
          const { data, error } = await supabase
            .from('recipes')
            .insert({
              user_id: user.id,
              title: titulo,
              content: result.content,
              time: "30 min",
              calories: "320 kcal",
              portions: "1",
              diet_type: formData.tipoAlimentacao,
              meal_type: formData.refeicaoDesejada,
              dietary_restrictions: formData.restricoesAlimentares,
            })
            .select('id')
            .single();
            
          if (error) {
            console.error("Erro ao salvar receita:", error);
          } else if (data) {
            recipeId = data.id;
          }
        }
        
        setReceitaGerada({
          id: recipeId,
          titulo: titulo,
          tempo: "30 min",
          calorias: "320 kcal",
          descricao: result.content,
          isFavorite: false
        });
        
        setFormSubmitted(true);
      } else {
        console.error("Erro na resposta da API:", result);
        toast.error("Erro ao gerar a receita. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar receita:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsFavorite = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar receitas favoritas.");
      return;
    }

    try {
      setIsSaving(true);
      
      if (receitaGerada.id) {
        const { error } = await supabase
          .from('recipes')
          .update({ is_favorite: !receitaGerada.isFavorite })
          .eq('id', receitaGerada.id);
          
        if (error) throw error;
        
        setReceitaGerada(prev => ({
          ...prev,
          isFavorite: !prev.isFavorite
        }));
        
        toast.success(receitaGerada.isFavorite 
          ? "Receita removida dos favoritos" 
          : "Receita adicionada aos favoritos");
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            user_id: user.id,
            title: receitaGerada.titulo,
            content: receitaGerada.descricao,
            time: receitaGerada.tempo,
            calories: receitaGerada.calorias,
            portions: "1",
            diet_type: formData.tipoAlimentacao,
            meal_type: formData.refeicaoDesejada,
            dietary_restrictions: formData.restricoesAlimentares,
            is_favorite: true
          })
          .select('id')
          .single();
          
        if (error) throw error;
        
        if (data) {
          setReceitaGerada(prev => ({
            ...prev,
            id: data.id,
            isFavorite: true
          }));
          toast.success("Receita adicionada aos favoritos");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar favorito:", error);
      toast.error("Não foi possível salvar a receita como favorita");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToFolder = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar receitas em pastas.");
      return;
    }

    setShowFolderDialog(true);
  };

  const handleSaveToFolderConfirm = async () => {
    try {
      setIsSaving(true);
      
      let recipeId = receitaGerada.id;
      
      if (!recipeId) {
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            user_id: user.id,
            title: receitaGerada.titulo,
            content: receitaGerada.descricao,
            time: receitaGerada.tempo,
            calories: receitaGerada.calorias,
            portions: "1",
            diet_type: formData.tipoAlimentacao,
            meal_type: formData.refeicaoDesejada,
            dietary_restrictions: formData.restricoesAlimentares
          })
          .select('id')
          .single();
          
        if (error) throw error;
        
        if (data) {
          recipeId = data.id;
          setReceitaGerada(prev => ({ ...prev, id: data.id }));
        }
      }
      
      let folderId = selectedFolder;
      
      if (!selectedFolder && folderName.trim()) {
        const { data: existingFolder, error: checkError } = await supabase
          .from('folders')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', folderName.trim())
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        if (existingFolder) {
          folderId = existingFolder.id;
        } else {
          const { data: newFolder, error: createError } = await supabase
            .from('folders')
            .insert({
              user_id: user.id,
              name: folderName.trim()
            })
            .select('id')
            .single();
            
          if (createError) throw createError;
          
          if (newFolder) {
            folderId = newFolder.id;
          }
        }
      }
      
      if (!recipeId || !folderId) {
        throw new Error("Falha ao identificar receita ou pasta");
      }
      
      const { error } = await supabase
        .from('folder_recipes')
        .insert({
          folder_id: folderId,
          recipe_id: recipeId
        });
        
      if (error) {
        if (error.code === '23505') {
          toast.info("Esta receita já está na pasta selecionada");
        } else {
          throw error;
        }
      } else {
        toast.success("Receita salva na pasta com sucesso!");
      }
      
      setShowFolderDialog(false);
      setFolderName("");
      setSelectedFolder("");
      
    } catch (error) {
      console.error("Erro ao salvar em pasta:", error);
      toast.error("Não foi possível salvar a receita na pasta");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    const { tipoAlimentacao, refeicaoDesejada, objetivoAlimentar } = formData;
    return tipoAlimentacao && refeicaoDesejada && objetivoAlimentar;
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
            <Utensils className="h-6 w-6 mr-2 text-primary" />
            Solicitar Receita Personalizada
          </h1>
        </div>

        {!formSubmitted ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Preencha os detalhes para sua receita personalizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-medium block mb-3">1. Tipo de Alimentação</Label>
                  <RadioGroup 
                    value={formData.tipoAlimentacao} 
                    onValueChange={(value) => handleChange('tipoAlimentacao', value)}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {['Vegana', 'Vegetariana', 'Sem Glúten', 'Sem Lactose', 'Para Diabéticos', 'Low Carb'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <RadioGroupItem value={item} id={`tipo-${item}`} />
                        <Label htmlFor={`tipo-${item}`} className="cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium block mb-3">2. Refeição Desejada</Label>
                  <RadioGroup 
                    value={formData.refeicaoDesejada} 
                    onValueChange={(value) => handleChange('refeicaoDesejada', value)}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {['Café da Manhã', 'Almoço', 'Lanche', 'Jantar', 'Sobremesa'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <RadioGroupItem value={item} id={`refeicao-${item}`} />
                        <Label htmlFor={`refeicao-${item}`} className="cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="restricoes" className="text-base font-medium block mb-3">
                    3. Restrições Alimentares
                  </Label>
                  <Input
                    id="restricoes"
                    placeholder="Ex: alergia a amendoim, intolerância à lactose..."
                    value={formData.restricoesAlimentares}
                    onChange={(e) => handleChange('restricoesAlimentares', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ingredientes" className="text-base font-medium block mb-1">
                    4. Ingredientes Disponíveis (opcional)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Liste os ingredientes que você tem em casa e gostaria de utilizar
                  </p>
                  <Textarea
                    id="ingredientes"
                    placeholder="Ex: frango, brócolis, batata doce, azeite..."
                    value={formData.ingredientesDisponiveis}
                    onChange={(e) => handleChange('ingredientesDisponiveis', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium block mb-3">6. Objetivo Alimentar</Label>
                  <RadioGroup 
                    value={formData.objetivoAlimentar} 
                    onValueChange={(value) => handleChange('objetivoAlimentar', value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {[
                      'Emagrecer', 
                      'Controlar Glicemia', 
                      'Ganhar Massa Muscular',
                      'Manutenção da Saúde'
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <RadioGroupItem value={item} id={`objetivo-${item}`} />
                        <Label htmlFor={`objetivo-${item}`} className="cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <CardFooter className="px-0 pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={!isFormValid() || isLoading} 
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Gerando Receita...
                      </>
                    ) : (
                      <>
                        <Carrot className="mr-2 h-5 w-5" />
                        Gerar Receita
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-2xl flex items-center text-primary">
                <Check className="mr-2 h-6 w-6" />
                Sua Receita Personalizada!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Utensils className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary">
                      {receitaGerada.titulo}
                      {receitaGerada.isFavorite && (
                        <Star className="inline-block ml-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </h3>
                    
                    <div className="mt-4 flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{receitaGerada.tempo}</span>
                      </div>
                      <div className="flex items-center">
                        <Flame className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span>{receitaGerada.calorias}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium mb-3">Detalhes da Receita</h3>
                  <div className="whitespace-pre-line text-sm">
                    {receitaGerada.descricao}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleSaveAsFavorite}
                    variant={receitaGerada.isFavorite ? "outline" : "default"}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Star className={`mr-2 h-5 w-5 ${receitaGerada.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    {receitaGerada.isFavorite ? "Remover dos favoritos" : "Salvar como favorita"}
                  </Button>
                  
                  <Button
                    onClick={handleSaveToFolder}
                    variant="outline"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Folder className="mr-2 h-5 w-5" />
                    Salvar em pasta
                  </Button>
                </div>
                
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={() => setFormSubmitted(false)} variant="outline">
                    Modificar Receita
                  </Button>
                  <Link to="/">
                    <Button>Voltar ao Início</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar receita em pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userFolders.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="folder">Selecione uma pasta existente</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger id="folder">
                    <SelectValue placeholder="Selecione uma pasta" />
                  </SelectTrigger>
                  <SelectContent>
                    {userFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-folder">Ou crie uma nova pasta</Label>
              <Input
                id="new-folder"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Nome da nova pasta"
                disabled={!!selectedFolder}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveToFolderConfirm}
              disabled={(!selectedFolder && !folderName.trim()) || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceitaPersonalizada;

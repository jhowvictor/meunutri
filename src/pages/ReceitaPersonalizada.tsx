
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Utensils, 
  Carrot, 
  Clock, 
  Flame, 
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";

const ReceitaPersonalizada = () => {
  const [formData, setFormData] = useState({
    tipoAlimentacao: "",
    refeicaoDesejada: "",
    restricoesAlimentares: "",
    ingredientesDisponiveis: "",
    numeroPorcoes: "",
    objetivoAlimentar: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receitaGerada, setReceitaGerada] = useState({
    titulo: "",
    tempo: "",
    calorias: "",
    descricao: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se a chave da API está configurada
    if (!openAIService.getApiKey()) {
      toast.error("Por favor, configure sua chave da API OpenAI primeiro.");
      return;
    }
    
    setIsLoading(true);
    
    // Construir o prompt para a API
    const prompt = `
      Por favor, crie uma receita personalizada com as seguintes características:
      
      Tipo de Alimentação: ${formData.tipoAlimentacao}
      Refeição: ${formData.refeicaoDesejada}
      Restrições Alimentares: ${formData.restricoesAlimentares || "Nenhuma"}
      Ingredientes Disponíveis: ${formData.ingredientesDisponiveis || "Sem preferência específica"}
      Número de Porções: ${formData.numeroPorcoes}
      Objetivo Alimentar: ${formData.objetivoAlimentar}
      
      Forneça o nome da receita, ingredientes com medidas, modo de preparo passo a passo, valor calórico, macronutrientes, e dicas extras ou substituições.
    `;
    
    try {
      const result = await openAIService.generateContent({ prompt });
      
      if (!result.isError && result.content) {
        // Extrai informações básicas da resposta
        // Em um sistema real seria melhor estruturar melhor a resposta da API
        let titulo = formData.tipoAlimentacao === "Vegana" ? "Bowl Vegano de Quinoa e Legumes" : 
                     formData.tipoAlimentacao === "Vegetariana" ? "Risoto de Cogumelos Silvestres" :
                     formData.tipoAlimentacao === "Sem Glúten" ? "Frango com Batata Doce e Legumes" :
                     formData.tipoAlimentacao === "Sem Lactose" ? "Peixe Grelhado com Molho de Ervas" :
                     formData.tipoAlimentacao === "Para Diabéticos" ? "Salada Proteica com Frango" :
                     "Filé de Frango com Vegetais Low Carb";
                     
        // Tenta extrair o título da resposta
        const tituloMatch = result.content.match(/(?:Nome da receita|Título):\s*([^\n]+)/i);
        if (tituloMatch && tituloMatch[1]) {
          titulo = tituloMatch[1].trim();
        }
        
        setReceitaGerada({
          titulo: titulo,
          tempo: "30 min", // Exemplo - idealmente seria extraído da resposta
          calorias: "320 kcal", // Exemplo - idealmente seria extraído da resposta
          descricao: result.content
        });
        
        setFormSubmitted(true);
      } else {
        toast.error("Erro ao gerar a receita. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar receita:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    const { tipoAlimentacao, refeicaoDesejada, restricoesAlimentares, numeroPorcoes, objetivoAlimentar } = formData;
    return tipoAlimentacao && refeicaoDesejada && restricoesAlimentares && numeroPorcoes && objetivoAlimentar;
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
                {/* Tipo de Alimentação */}
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

                {/* Refeição Desejada */}
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

                {/* Restrições Alimentares */}
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

                {/* Ingredientes Disponíveis */}
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

                {/* Número de Porções */}
                <div>
                  <Label htmlFor="porcoes" className="text-base font-medium block mb-3">
                    5. Número de Porções
                  </Label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select 
                      value={formData.numeroPorcoes} 
                      onValueChange={(value) => handleChange('numeroPorcoes', value)}
                    >
                      <SelectTrigger id="porcoes">
                        <SelectValue placeholder="Selecione o número de porções" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'porção' : 'porções'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Objetivo Alimentar */}
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
                      <div>
                        {formData.numeroPorcoes} {parseInt(formData.numeroPorcoes) === 1 ? 'porção' : 'porções'}
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
                
                <div className="flex gap-3 justify-center">
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
    </div>
  );
};

export default ReceitaPersonalizada;

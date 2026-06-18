
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ChefHat, 
  Send,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";
import SaveToLibrary from "@/components/SaveToLibrary";
import SendToPatient from "@/components/SendToPatient";

const ReceitaPersonalizada = () => {
  const [formData, setFormData] = useState({
    tipoAlimentacao: "",
    restricoesAlimentares: "",
    ingredientesDisponiveis: "",
    objetivoAlimentar: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [receitaGerada, setReceitaGerada] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const prompt = `
        Como um chef especializado em alimentação saudável, crie uma receita com os seguintes requisitos:
        
        Tipo de Alimentação: ${formData.tipoAlimentacao}
        Restrições Alimentares: ${formData.restricoesAlimentares || "Nenhuma"}
        Ingredientes Disponíveis: ${formData.ingredientesDisponiveis || "Sem preferência específica"}
        Objetivo Alimentar: ${formData.objetivoAlimentar}
        
        Por favor, forneça a receita no seguinte formato:
        
        🍽 Nome da Receita: [TÍTULO CRIATIVO]
        
        📝 Ingredientes:
        - Liste todos com quantidades exatas
        
        👨‍🍳 Modo de Preparo:
        1. Passo a passo detalhado
        2. Inclua tempos específicos
        3. Mencione dicas importantes
        
        ⏲ Tempo de Preparo:
        
        🍴 Rendimento:
        
        📊 Informações Nutricionais (por porção):
        - Calorias
        - Proteínas
        - Carboidratos
        - Gorduras boas
        
        💡 Dica do Chef:
        
        IMPORTANTE: Use ingredientes simples e fáceis de encontrar. Mantenha as instruções claras e diretas.
      `;

      const result = await openAIService.generateContent({
        prompt,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 1000
      });

      if (!result.isError && result.content) {
        setReceitaGerada(result.content);
        toast.success("Sua receita foi gerada com sucesso!");
      } else {
        throw new Error("Não foi possível gerar a receita");
      }
    } catch (error) {
      console.error("Erro ao gerar receita:", error);
      toast.error("Ops! Não foi possível gerar sua receita. Tente novamente.");
    } finally {
      setIsLoading(false);
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
            <ChefHat className="h-6 w-6 mr-2 text-primary" />
            Gerar Receita Personalizada
          </h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tipoAlimentacao">Tipo de Alimentação Desejada</Label>
              <Input
                id="tipoAlimentacao"
                placeholder="Ex: Vegana, Low Carb, Mediterrânea..."
                value={formData.tipoAlimentacao}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoAlimentacao: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restricoes">Restrições Alimentares</Label>
              <Input
                id="restricoes"
                placeholder="Ex: sem glúten, sem lactose..."
                value={formData.restricoesAlimentares}
                onChange={(e) => setFormData(prev => ({ ...prev, restricoesAlimentares: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredientes">Ingredientes Disponíveis (opcional)</Label>
              <Input
                id="ingredientes"
                placeholder="Ex: frango, quinoa, legumes..."
                value={formData.ingredientesDisponiveis}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredientesDisponiveis: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo Alimentar</Label>
              <Input
                id="objetivo"
                placeholder="Ex: ganho de massa, emagrecimento..."
                value={formData.objetivoAlimentar}
                onChange={(e) => setFormData(prev => ({ ...prev, objetivoAlimentar: e.target.value }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando Receita...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Gerar Receita
                </>
              )}
            </Button>
          </form>

          {receitaGerada && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold">Sua Receita Personalizada</h2>
                <SaveToLibrary
                  contentType="receita"
                  title={`Receita ${formData.tipoAlimentacao || ""}`.trim()}
                  content={receitaGerada}
                  metadata={formData}
                />
                <SendToPatient
                  contentType="receita"
                  title={`Receita ${formData.tipoAlimentacao || ""}`.trim() || "Receita"}
                  content={receitaGerada}
                />
              </div>
              <div className="bg-white text-black p-6 rounded-lg shadow-sm border">
                <pre className="whitespace-pre-wrap font-sans text-black">{receitaGerada}</pre>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReceitaPersonalizada;

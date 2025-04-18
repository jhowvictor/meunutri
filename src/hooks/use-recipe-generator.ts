
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";

interface RecipePreferences {
  tipoAlimentacao: string;
  refeicaoDesejada: string;
  restricoesAlimentares?: string;
  ingredientesDisponiveis?: string;
  objetivoAlimentar: string;
}

interface GeneratedRecipe {
  titulo: string;
  tempo: string;
  calorias: string;
  descricao: string;
}

export const useRecipeGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Função principal para gerar receitas
  const generateRecipe = async (preferences: RecipePreferences): Promise<GeneratedRecipe | null> => {
    try {
      // Indica início do processo
      setIsLoading(true);
      toast("Gerando sua receita personalizada...");

      // Monta o prompt para a IA com as preferências do usuário
      const prompt = `
        Por favor, crie uma receita personalizada com base nas seguintes características:
        
        Tipo de Alimentação: ${preferences.tipoAlimentacao}
        Refeição: ${preferences.refeicaoDesejada}
        Restrições Alimentares: ${preferences.restricoesAlimentares || "Nenhuma"}
        Ingredientes Disponíveis: ${preferences.ingredientesDisponiveis || "Sem preferência específica"}
        Objetivo Alimentar: ${preferences.objetivoAlimentar}
        
        Forneça o nome da receita, ingredientes com medidas, modo de preparo passo a passo, valor calórico, macronutrientes, e dicas extras ou substituições.
        IMPORTANTE: O nome da receita deve começar com "Nome da Receita: " para facilitar a extração.
      `;

      // Chama o serviço de IA para gerar a receita
      const result = await openAIService.generateContent({ prompt });

      if (!result.isError && result.content) {
        // Extrai o título da receita do conteúdo gerado
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

        // Monta o objeto com a receita gerada
        const generatedRecipe: GeneratedRecipe = {
          titulo,
          tempo: "30 min", // Valor padrão
          calorias: "320 kcal", // Valor padrão
          descricao: result.content,
        };

        // Notifica sucesso
        toast.success("Receita gerada com sucesso!");
        return generatedRecipe;
      } else {
        throw new Error("Não foi possível gerar a receita");
      }
    } catch (error) {
      // Trata erros de forma amigável
      console.error("Erro ao gerar receita:", error);
      toast.error("Ops! Não foi possível gerar sua receita. Tente novamente.");
      return null;
    } finally {
      // Sempre finaliza o loading
      setIsLoading(false);
    }
  };

  return {
    generateRecipe,
    isLoading
  };
};

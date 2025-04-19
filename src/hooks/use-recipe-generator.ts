
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

      // Monta o prompt para a IA com as preferências do usuário com formato estruturado
      const prompt = `Como nutricionista especializado em alimentação saudável, funcional e vegana, crie uma receita personalizada com base nas seguintes preferências:

Tipo de Refeição: ${preferences.refeicaoDesejada}
Tipo de Alimentação/Restrições: ${preferences.tipoAlimentacao}
Restrições Adicionais: ${preferences.restricoesAlimentares || "Nenhuma"}
Ingredientes Disponíveis: ${preferences.ingredientesDisponiveis || "Sem preferência específica"}
Objetivo Alimentar: ${preferences.objetivoAlimentar}

Por favor, forneça a receita no seguinte formato:

🍽 Nome da Receita: [TÍTULO]

📝 Ingredientes:
- Liste todos com quantidades exatas

👨‍🍳 Modo de preparo:
1. Passo a passo detalhado
2. Inclua tempos de preparo
3. Mencione rendimento

📊 Informações nutricionais por porção:
- Calorias (kcal)
- Proteínas (g)
- Carboidratos (g)
- Gorduras boas (g)

💡 Finalize com uma dica de consumo ou variação da receita.

IMPORTANTE: Mantenha a resposta clara, objetiva e com no máximo 250 palavras.
IMPORTANTE: O nome da receita deve começar com "Nome da Receita: " para facilitar a extração.`;

      // Chama o serviço de IA para gerar a receita
      const result = await openAIService.generateContent({ 
        prompt,
        model: "gpt-4o",
        max_tokens: 1000,
        temperature: 0.7
      });

      if (!result.isError && result.content) {
        // Extrai o título da receita do conteúdo gerado
        let titulo = "Nova Receita Personalizada";
        const padroesTitulo = [
          /(?:Nome da [Rr]eceita|Título):\s*([^\n]+)/i,
          /^\s*🍽\s*([^\n]+)/m,
          /^\s*([^\n:]+)(?:\n|$)/m,
        ];
        
        for (const padrao of padroesTitulo) {
          const match = result.content.match(padrao);
          if (match && match[1]?.trim()) {
            titulo = match[1].trim();
            break;
          }
        }

        // Extrai informações nutricionais básicas
        const caloriasMatch = result.content.match(/(\d+)\s*kcal/i);
        const calorias = caloriasMatch ? `${caloriasMatch[1]} kcal` : "320 kcal";

        // Extrai tempo de preparo
        const tempoMatch = result.content.match(/(?:tempo|preparo|leva):\s*(\d+[^\n]*)/i);
        const tempo = tempoMatch ? tempoMatch[1].trim() : "30 min";

        // Monta o objeto com a receita gerada
        const generatedRecipe: GeneratedRecipe = {
          titulo,
          tempo,
          calorias,
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

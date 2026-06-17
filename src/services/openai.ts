// Serviço de IA — agora chama edge functions seguras (a chave OpenAI fica no servidor)
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

interface OpenAIRequestParams {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  language?: string;
  isEbook?: boolean;
  isImageAnalysis?: boolean;
}

interface OpenAIVisionRequestParams {
  base64Image: string;
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  language?: string;
}

interface OpenAIResponse {
  content: string;
  isError: boolean;
}

export class OpenAIService {
  // Mantido por compatibilidade — não faz mais nada (a chave está no servidor)
  setApiKey(_key: string) {}
  getApiKey(): string | null {
    return "configured";
  }

  async generateContentWithVision({
    base64Image,
    prompt,
    model = "gpt-4o",
    max_tokens = 1500,
    temperature = 0.7,
    language = "pt",
  }: OpenAIVisionRequestParams): Promise<OpenAIResponse> {
    try {
      const systemMessage = `Você é um nutricionista especialista em análise visual de alimentos e refeições.

IMPORTANTE: Responda sempre no seguinte idioma: ${language}.

PARA ANÁLISE DE REFEIÇÕES:
1. Identifique os ingredientes principais visíveis.
2. Forneça uma estimativa dos macronutrientes (carboidratos, proteínas, gorduras em gramas) e calorias totais (kcal).
3. Classifique a refeição como: Vegana (SIM/NÃO), Vegetariana (SIM/NÃO), Sem Glúten (SIM/NÃO), Sem Lactose (SIM/NÃO), Apta para diabéticos (SIM/NÃO).
4. Forneça uma análise nutricional breve e clara.
5. Sugira melhorias para a refeição.

IMPORTANTE: Mesmo que seja uma estimativa, você DEVE fornecer valores numéricos para carboidratos, proteínas, gorduras e calorias.`;

      if (!base64Image || base64Image.length < 100) {
        return { content: "Erro: imagem inválida.", isError: true };
      }

      const { data, error } = await supabase.functions.invoke("openai-vision", {
        body: { base64Image, prompt, systemMessage, model, max_tokens, temperature },
      });

      if (error) {
        console.error("Erro edge function vision:", error);
        toast.error("Erro ao analisar imagem. Tente novamente.");
        return { content: "", isError: true };
      }

      if (data?.error) {
        console.error("Erro OpenAI vision:", data.error);
        toast.error(data.error);
        return { content: "", isError: true };
      }

      return { content: data.content, isError: false };
    } catch (error) {
      console.error("Erro na requisição vision:", error);
      toast.error("Erro ao comunicar com o servidor.");
      return { content: "", isError: true };
    }
  }

  async generateContent({
    prompt,
    model = "gpt-4o-mini",
    max_tokens = 1000,
    temperature = 0.7,
    language = "pt",
    isEbook = false,
    isImageAnalysis = false,
  }: OpenAIRequestParams): Promise<OpenAIResponse> {
    try {
      let systemMessage = `Você é um chef de cozinha e nutricionista especialista em receitas saudáveis e funcionais. Sua missão é criar receitas 100% personalizadas, com base nas preferências e necessidades da pessoa.`;

      if (
        prompt.toLowerCase().includes("receita") ||
        prompt.toLowerCase().includes("cozinhar") ||
        prompt.toLowerCase().includes("preparar")
      ) {
        systemMessage += `\n\nQUANDO FORNECER UMA RECEITA:
1. SEMPRE começar com "Nome da Receita: [TÍTULO DA RECEITA]" em uma linha separada no início.
2. Seguir com as seções: Ingredientes, Modo de Preparo, Informações Nutricionais, Dicas.
3. O título da receita deve ser claro e refletir o prato principal.`;
      }

      if (isEbook) {
        systemMessage = `Você é um chef de cozinha e nutricionista especialista em receitas saudáveis e funcionais. Sua tarefa é criar um e-book de receitas completo.

IMPORTANTE PARA E-BOOK DE RECEITAS:
1. Você DEVE cumprir TODAS as especificações do usuário (como número de receitas solicitadas).
2. Se a pessoa pedir um número específico de receitas, forneça EXATAMENTE esse número.
3. Cada receita DEVE seguir o formato: Título, Ingredientes, Modo de Preparo, Informações Nutricionais.
4. O e-book deve ter um título claramente identificado no início.`;
        model = "gpt-4o";
        max_tokens = 4000;
        temperature = 0.7;
      }

      if (
        isImageAnalysis ||
        (prompt.toLowerCase().includes("analise") &&
          (prompt.toLowerCase().includes("refeição") ||
            prompt.toLowerCase().includes("comida") ||
            prompt.toLowerCase().includes("alimento")))
      ) {
        systemMessage = `Você é um nutricionista especialista em análise visual de alimentos e refeições.

PARA ANÁLISE DE REFEIÇÕES:
1. Identifique os ingredientes principais visíveis.
2. Forneça estimativa de macronutrientes e calorias.
3. Classifique: Vegana, Vegetariana, Sem Glúten, Sem Lactose, Apta para diabéticos (SIM/NÃO).
4. Análise nutricional breve.
5. Sugira melhorias.`;
        model = "gpt-4o";
        max_tokens = 1500;
      }

      systemMessage += `\n\nIMPORTANTE: Responda sempre no seguinte idioma: ${language}.`;

      const { data, error } = await supabase.functions.invoke("openai-chat", {
        body: { prompt, systemMessage, model, max_tokens, temperature },
      });

      if (error) {
        console.error("Erro edge function chat:", error);
        toast.error("Erro ao gerar conteúdo. Tente novamente.");
        return { content: "", isError: true };
      }

      if (data?.error) {
        console.error("Erro OpenAI chat:", data.error);
        toast.error(data.error);
        return { content: "", isError: true };
      }

      return { content: data.content, isError: false };
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast.error("Erro ao comunicar com o servidor.");
      return { content: "", isError: true };
    }
  }
}

export const openAIService = new OpenAIService();


// Esta é uma classe para gerenciar as chamadas para a API do OpenAI (ChatGPT)
import { toast } from "@/components/ui/sonner";

// Definição de tipos
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
  private apiKey: string | null = "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";
  private apiUrl = "https://api.openai.com/v1/chat/completions";
  
  // Método para definir a chave da API
  setApiKey(key: string) {
    this.apiKey = key;
  }
  
  // Método para obter a chave da API
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  // Método para gerar conteúdo com análise de imagem/visão
  async generateContentWithVision({
    base64Image,
    prompt,
    model = "gpt-4o",
    max_tokens = 1000,
    temperature = 0.7,
    language = "pt"
  }: OpenAIVisionRequestParams): Promise<OpenAIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      toast.error("Chave da API não configurada. Por favor, configure-a nas configurações.");
      return {
        content: "",
        isError: true
      };
    }
    
    try {
      const systemMessage = `Você é um nutricionista especialista em análise visual de alimentos e refeições.
      
      IMPORTANTE: Responda sempre no seguinte idioma: ${language}.
      
      PARA ANÁLISE DE REFEIÇÕES:
      1. Identifique os ingredientes principais visíveis.
      2. Forneça uma estimativa dos macronutrientes (carboidratos, proteínas, gorduras em gramas) e calorias totais (kcal).
      3. Classifique a refeição como: Vegana (SIM/NÃO), Vegetariana (SIM/NÃO), Sem Glúten (SIM/NÃO), Sem Lactose (SIM/NÃO), Apta para diabéticos (SIM/NÃO).
      4. Forneça uma análise nutricional breve e clara.
      5. Sugira melhorias para a refeição.
      
      IMPORTANTE: Mesmo que seja uma estimativa, você DEVE fornecer valores numéricos para carboidratos, proteínas, gorduras e calorias. Use seu conhecimento nutricional para fazer a melhor estimativa possível.`;
      
      console.log("Enviando solicitação de análise visual para OpenAI...");
      
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: systemMessage
            },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: max_tokens,
          temperature: temperature,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na API do OpenAI:", errorData);
        
        if (errorData.error?.code === 'context_length_exceeded') {
          return {
            content: "A imagem enviada é muito grande ou complexa para análise. Por favor, tente com uma imagem menor ou mais simples.",
            isError: true
          };
        } else if (errorData.error?.type === 'invalid_request_error') {
          return {
            content: "Solicitação inválida: " + errorData.error.message,
            isError: true
          };
        } else {
          return {
            content: "Erro ao gerar conteúdo. Por favor, tente novamente.",
            isError: true
          };
        }
      }
      
      const data = await response.json();
      console.log("Resposta de análise visual recebida com sucesso, tamanho do conteúdo:", data.choices[0].message.content.length);
      
      return {
        content: data.choices[0].message.content,
        isError: false
      };
    } catch (error) {
      console.error("Erro na requisição para OpenAI Vision:", error);
      return {
        content: "Erro ao se comunicar com a API. Verifique sua conexão e tente novamente.",
        isError: true
      };
    }
  }
  
  // Método para gerar conteúdo
  async generateContent({ 
    prompt, 
    model = "gpt-4o-mini", 
    max_tokens = 1000, 
    temperature = 0.7, 
    language = "pt",
    isEbook = false,
    isImageAnalysis = false
  }: OpenAIRequestParams): Promise<OpenAIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      toast.error("Chave da API não configurada. Por favor, configure-a nas configurações.");
      return {
        content: "",
        isError: true
      };
    }
    
    try {
      // Formato específico para receitas
      let systemMessage = `Você é um chef de cozinha e nutricionista especialista em receitas saudáveis e funcionais. Sua missão é criar receitas 100% personalizadas, com base nas preferências e necessidades da pessoa.`;
      
      // Se o prompt menciona receita, adicione instruções de formatação
      if (prompt.toLowerCase().includes('receita') || prompt.toLowerCase().includes('cozinhar') || prompt.toLowerCase().includes('preparar')) {
        systemMessage += `\n\nQUANDO FORNECER UMA RECEITA:
1. SEMPRE começar com "Nome da Receita: [TÍTULO DA RECEITA]" em uma linha separada no início.
2. Seguir com as seções: Ingredientes, Modo de Preparo, Informações Nutricionais, Dicas.
3. O título da receita deve ser claro e refletir o prato principal.`;
      }
      
      // Instruções específicas para e-books
      if (isEbook) {
        systemMessage = `Você é um chef de cozinha e nutricionista especialista em receitas saudáveis e funcionais. Sua tarefa é criar um e-book de receitas completo.

IMPORTANTE PARA E-BOOK DE RECEITAS:
1. Você DEVE cumprir TODAS as especificações do usuário (como número de receitas solicitadas).
2. Se a pessoa pedir um número específico de receitas (como 10, 15, 20, etc), você DEVE fornecer EXATAMENTE esse número completo, sem exceções.
3. Cada receita DEVE seguir o formato: Título da Receita, Ingredientes, Modo de Preparo, Informações Nutricionais.
4. O e-book deve ter um título claramente identificado no início do texto.
5. VERIFIQUE sua resposta antes de enviar e conte se o número de receitas está correto.`;
        
        // Para e-books, use o modelo mais avançado e mais tokens
        model = "gpt-4o";
        max_tokens = 4000; // Aumentar significativamente o limite de tokens para e-books
        temperature = 0.7; // Definir temperatura para mais consistência
      }

      // Instruções específicas para análise de alimentos
      if (isImageAnalysis || prompt.toLowerCase().includes('analise') && (prompt.toLowerCase().includes('refeição') || prompt.toLowerCase().includes('comida') || prompt.toLowerCase().includes('alimento'))) {
        systemMessage = `Você é um nutricionista especialista em análise visual de alimentos e refeições. 
        
PARA ANÁLISE DE REFEIÇÕES:
1. Identifique os ingredientes principais visíveis.
2. Forneça uma estimativa dos macronutrientes (carboidratos, proteínas, gorduras em gramas) e calorias totais (kcal).
3. Classifique a refeição como: Vegana (SIM/NÃO), Vegetariana (SIM/NÃO), Sem Glúten (SIM/NÃO), Sem Lactose (SIM/NÃO), Apta para diabéticos (SIM/NÃO).
4. Forneça uma análise nutricional breve e clara.
5. Sugira melhorias para a refeição.

IMPORTANTE: Mesmo que seja uma estimativa, você DEVE fornecer valores numéricos para carboidratos, proteínas, gorduras e calorias. Use seu conhecimento nutricional para fazer a melhor estimativa possível.`;

        // Para análise de imagem, use sempre o modelo avançado
        model = "gpt-4o";
        max_tokens = 1500;
      }
      
      // Adiciona instrução de idioma
      systemMessage += `\n\nIMPORTANTE: Responda sempre no seguinte idioma: ${language}.`;
      
      console.log("Enviando solicitação para OpenAI com os parâmetros:", {
        model,
        max_tokens,
        isEbook,
        isImageAnalysis,
        promptLength: prompt.length
      });
      
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: systemMessage
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: max_tokens,
          temperature: temperature,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro na API do OpenAI:", errorData);
        
        // Mensagens de erro mais detalhadas baseadas no código de erro
        if (errorData.error?.code === 'context_length_exceeded') {
          toast.error("O conteúdo solicitado é muito grande. Por favor, tente um pedido menor.");
        } else if (errorData.error?.type === 'invalid_request_error') {
          toast.error("Solicitação inválida: " + errorData.error.message);
        } else {
          toast.error("Erro ao gerar conteúdo. Por favor, tente novamente.");
        }
        
        return {
          content: "",
          isError: true
        };
      }
      
      const data = await response.json();
      console.log("Resposta recebida com sucesso, tamanho do conteúdo:", data.choices[0].message.content.length);
      
      return {
        content: data.choices[0].message.content,
        isError: false
      };
    } catch (error) {
      console.error("Erro na requisição para OpenAI:", error);
      toast.error("Erro ao se comunicar com a API. Verifique sua conexão e tente novamente.");
      return {
        content: "",
        isError: true
      };
    }
  }
}

// Exportar uma instância única do serviço
export const openAIService = new OpenAIService();

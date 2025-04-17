
// Esta é uma classe para gerenciar as chamadas para a API do OpenAI (ChatGPT)
import { toast } from "@/components/ui/sonner";

// Definição de tipos
interface OpenAIRequestParams {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  language?: string;
  isEbook?: boolean; // Novo parâmetro para identificar solicitações de e-book
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
  
  // Método para gerar conteúdo
  async generateContent({ 
    prompt, 
    model = "gpt-4o-mini", 
    max_tokens = 1000, 
    temperature = 0.7, 
    language = "pt",
    isEbook = false 
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
        systemMessage += `\n\nIMPORTANTE PARA E-BOOK DE RECEITAS:
1. Você DEVE cumprir TODAS as especificações do usuário (como número de receitas solicitadas).
2. Se a pessoa pedir 20 receitas, você DEVE fornecer exatamente 20 receitas completas.
3. Se o usuário mencionar temas ou tipos específicos de receitas, você deve segui-los rigorosamente.
4. Cada receita deve ser completa com título, ingredientes, modo de preparo e informações nutricionais.
5. Você deve aproveitar ao máximo o espaço disponível para gerar o conteúdo completo solicitado.`;
        
        // Para e-books, use o modelo mais avançado e mais tokens
        model = "gpt-4o";
        max_tokens = 4000; // Aumentar significativamente o limite de tokens para e-books
      }
      
      // Adiciona instrução de idioma
      systemMessage += `\n\nIMPORTANTE: Responda sempre no seguinte idioma: ${language}.`;
      
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
        console.error("Erro na API:", errorData);
        toast.error("Erro ao gerar conteúdo. Por favor, tente novamente.");
        return {
          content: "",
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        isError: false
      };
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast.error("Erro ao se comunicar com a API. Verifique sua conexão.");
      return {
        content: "",
        isError: true
      };
    }
  }
}

// Exportar uma instância única do serviço
export const openAIService = new OpenAIService();

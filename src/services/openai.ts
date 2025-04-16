
// Esta é uma classe para gerenciar as chamadas para a API do OpenAI (ChatGPT)
import { toast } from "@/components/ui/sonner";

// Definição de tipos
interface OpenAIRequestParams {
  prompt: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
  content: string;
  isError: boolean;
}

export class OpenAIService {
  private apiKey: string | null = null;
  private apiUrl = "https://api.openai.com/v1/chat/completions";
  
  // Método para definir a chave da API
  setApiKey(key: string) {
    this.apiKey = key;
    // Salvar a chave no localStorage para uso futuro
    localStorage.setItem("openai_api_key", key);
  }
  
  // Método para obter a chave da API
  getApiKey(): string | null {
    // Tentar recuperar do localStorage se não estiver definido
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem("openai_api_key");
    }
    return this.apiKey;
  }
  
  // Método para gerar conteúdo
  async generateContent({ prompt, model = "gpt-4o-mini", max_tokens = 1000, temperature = 0.7 }: OpenAIRequestParams): Promise<OpenAIResponse> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      toast.error("Chave da API não configurada. Por favor, configure-a nas configurações.");
      return {
        content: "",
        isError: true
      };
    }
    
    try {
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
              content: "Você é um chef de cozinha e nutricionista especialista em receitas saudáveis e funcionais. Sua missão é criar receitas 100% personalizadas, com base nas preferências e necessidades da pessoa."
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


import { useState } from "react";
import { ChefHat, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { openAIService } from "@/services/openai";

// Definindo tipos para as mensagens
type MessageRole = "assistant" | "user";

interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

const MiniChef = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Olá! Sou o Mini Chef, seu assistente pessoal. Como posso te ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Prompt de sistema otimizado para respostas curtas e empáticas
    const systemPrompt = `🍳 Mini Chef - Assistente Culinário

Diretrizes para respostas:
✅ Máximo de 1000 caracteres
✅ Tom empático e amigável
✅ Use emojis quando apropriado
✅ Use tópicos e listas
✅ Seja direto e objetivo
✅ Termine com uma dica prática

Especialidades:
🥗 Nutrição
🍳 Receitas
🥑 Substituições
🏋️ Objetivos de saúde

IMPORTANTE: Sempre ao fornecer uma receita, comece com "Nome da Receita: [Título da Receita]" em uma linha separada no início.`;

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Construindo o prompt com o histórico da conversa
    const prompt = `${systemPrompt}\n\nHistórico da conversa:\n${messages
      .map((msg) => `${msg.role === "user" ? "Usuário" : "Mini Chef"}: ${msg.content}`)
      .join("\n")}\n\nUsuário: ${inputMessage}\n\nMini Chef:`;

    try {
      // Usar o modelo gpt-4o com mais tokens máximos para respostas mais completas
      const response = await openAIService.generateContent({ 
        prompt,
        model: "gpt-4o",  // Modelo mais avançado
        max_tokens: 2000, // Aumentar o limite de tokens
        temperature: 0.7  // Manter criatividade equilibrada
      });

      if (!response.isError && response.content) {
        // Adicionar resposta do assistente
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="lg" 
            className="rounded-full shadow-lg flex items-center gap-2 px-4 py-6"
          >
            <ChefHat size={24} />
            <span>Mini Chef</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md w-[90vw] p-0 h-[80vh] sm:h-[600px] flex flex-col">
          <SheetHeader className="px-4 py-3 border-b bg-primary/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src="/placeholder.svg" alt="Mini Chef" />
                <AvatarFallback className="bg-primary/20">
                  <ChefHat className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <SheetTitle>Mini Chef</SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-ping"></div>
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-ping delay-150"></div>
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-ping delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite uma mensagem..."
                className="resize-none"
                disabled={isLoading}
                rows={1}
              />
              <Button 
                size="icon"
                disabled={isLoading || !inputMessage.trim()} 
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MiniChef;

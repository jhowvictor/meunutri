
import { useState } from "react";
import { ChefHat, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import miniChefImg from "@/assets/mini-chef.png";

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
  const { user } = useAuth();

  const saveConversation = async () => {
    if (!user) {
      toast.error("Faça login para salvar.");
      return;
    }
    const convo = messages
      .map((m) => `${m.role === "user" ? "Você" : "Mini Chef"}: ${m.content}`)
      .join("\n\n");
    const firstUser = messages.find((m) => m.role === "user");
    const title = firstUser
      ? firstUser.content.slice(0, 60)
      : "Conversa com Mini Chef";
    const { error } = await supabase.from("library_items").insert({
      user_id: user.id,
      content_type: "mini_chef",
      title,
      content: convo,
    });
    if (error) {
      toast.error("Erro ao salvar conversa.");
    } else {
      toast.success("Conteúdo salvo com sucesso na sua Biblioteca.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    const prompt = `${systemPrompt}\n\nHistórico da conversa:\n${messages
      .map((msg) => `${msg.role === "user" ? "Usuário" : "Mini Chef"}: ${msg.content}`)
      .join("\n")}\n\nUsuário: ${inputMessage}\n\nMini Chef:`;

    try {
      const response = await openAIService.generateContent({
        prompt,
        model: "gpt-4o",
        max_tokens: 2000,
        temperature: 0.7,
      });

      if (!response.isError && response.content) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.content, timestamp: new Date() },
        ]);
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

  const quickSuggestions = [
    "Posso melhorar minha dieta?",
    "Adaptar uma receita",
    "Ajuda com meu treino",
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        {!isOpen && (
          <div className="absolute -top-12 right-14 glass-strong border border-primary/40 rounded-2xl px-3 py-1.5 text-xs font-medium whitespace-nowrap neon-glow-sm animate-[fadeIn_0.6s]">
            Posso te ajudar? <span className="text-primary">Fale comigo!</span>
            <div className="absolute -bottom-1 right-4 w-2 h-2 rotate-45 bg-card border-r border-b border-primary/40" />
          </div>
        )}
        <SheetTrigger asChild>
          <button
            aria-label="Abrir Mini Chef"
            className="relative h-16 w-16 rounded-full bg-primary flex items-center justify-center pulse-glow hover:scale-105 transition"
          >
            <img src={miniChefImg} alt="Mini Chef" className="h-12 w-12 object-contain" />
          </button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md w-[90vw] p-0 h-[80vh] sm:h-[600px] flex flex-col">
          <SheetHeader className="px-4 py-3 border-b bg-primary/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary bg-white">
                  <AvatarImage src={miniChefImg} alt="Mini Chef" className="object-contain" />
                  <AvatarFallback className="bg-primary/20">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <SheetTitle>Mini Chef</SheetTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={saveConversation}
                disabled={messages.length < 2}
                title="Salvar conversa na Biblioteca"
              >
                <Save className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Salvar</span>
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 border border-primary bg-white shrink-0">
                      <AvatarImage src={miniChefImg} alt="Mini Chef" className="object-contain" />
                      <AvatarFallback className="bg-primary/20">
                        <ChefHat className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-white text-black border border-border"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div
                      className={`text-xs mt-1 text-right ${
                        message.role === "user" ? "text-gray-500" : "opacity-70"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-8 w-8 border border-primary bg-white shrink-0">
                    <AvatarImage src={miniChefImg} alt="Mini Chef" className="object-contain" />
                    <AvatarFallback className="bg-primary/20">
                      <ChefHat className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
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
                className="resize-none bg-white text-black placeholder:text-gray-500 border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.45)] focus-visible:ring-primary focus-visible:ring-2"
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

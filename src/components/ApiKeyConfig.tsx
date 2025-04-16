
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";

const ApiKeyConfig = () => {
  const [apiKey, setApiKey] = useState("");
  const [open, setOpen] = useState(false);

  // Carregar a chave da API salva, se existir
  useEffect(() => {
    const savedKey = openAIService.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error("Por favor, insira uma chave de API válida.");
      return;
    }
    
    openAIService.setApiKey(apiKey.trim());
    toast.success("Chave da API configurada com sucesso!");
    setOpen(false);
  };

  const hasApiKey = !!openAIService.getApiKey();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed top-4 right-4 bg-white/80 backdrop-blur-sm z-50 group"
        >
          <Settings className={`h-4 w-4 mr-2 ${hasApiKey ? "text-green-500" : "text-orange-500"}`} />
          {hasApiKey ? "API Configurada" : "Configurar API"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Chave da API OpenAI</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Chave da API OpenAI (ChatGPT)</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-sm text-muted-foreground mt-2">
              A chave será armazenada apenas no seu navegador e nunca será compartilhada.
            </p>
          </div>
          <Button className="w-full" onClick={handleSaveKey}>
            Salvar Chave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyConfig;

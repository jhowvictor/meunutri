
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Check,
  Download,
  Loader2,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EbookPersonalizado = () => {
  const [formData, setFormData] = useState({
    detalhes: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [ebookGerado, setEbookGerado] = useState({
    titulo: "",
    conteudo: ""
  });

  const handleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      detalhes: value
    }));
    // Limpar mensagens de erro quando o usuário edita o campo
    if (requestError) setRequestError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resetar estados
    setRequestError(null);
    
    // Verificar se a chave da API está configurada
    if (!openAIService.getApiKey()) {
      toast.error("Por favor, configure sua chave da API OpenAI primeiro.");
      return;
    }
    
    setIsLoading(true);
    
    // Extrair números mencionados no texto (possível número de receitas)
    const numbersInRequest = formData.detalhes.match(/\d+/g) || [];
    const recipeCountMention = numbersInRequest.length > 0 
      ? `Observe que o usuário pediu especificamente ${numbersInRequest.join(', ')} de algo (provavelmente receitas). Este número deve ser respeitado.` 
      : '';
    
    // Construir o prompt para a API com ênfase no número exato de receitas
    const prompt = `
      Por favor, crie um e-book de receitas personalizado com base nas seguintes especificações:
      
      ${formData.detalhes}
      
      ${recipeCountMention}
      
      IMPORTANTE: Se for mencionado um número específico de receitas (como 10, 15, 20, etc), você DEVE fornecer EXATAMENTE esse número de receitas completas.
      
      Forneça:
      1. Um título atrativo para o e-book
      2. Uma breve introdução
      3. Uma lista completa com EXATAMENTE o número de receitas solicitadas, cada uma com ingredientes e modo de preparo
      4. Informação nutricional para cada receita
      5. Dicas e conclusão
    `;
    
    try {
      console.log("Iniciando geração de e-book com prompt de tamanho:", prompt.length);
      
      // Passando isEbook: true para indicar que é uma solicitação de e-book
      const result = await openAIService.generateContent({
        prompt: prompt,
        max_tokens: 4000,  // Aumentando os tokens para garantir que todas as receitas sejam geradas
        isEbook: true      // Marcador para identificar que é um e-book
      });
      
      if (!result.isError && result.content) {
        console.log("E-book gerado com sucesso, tamanho:", result.content.length);
        
        // Tenta extrair o título do e-book da resposta
        let titulo = "E-book Personalizado";
        
        // Tenta extrair o título da resposta com diversos patterns possíveis
        const titlePatterns = [
          /(?:Título|E-book|Título do E-book|Nome do E-book):\s*([^\n]+)/i,
          /^#\s*([^\n]+)/m,
          /^\*\*([^*]+)\*\*/m,
          /^(.+?)(?:\n|$)/
        ];
        
        for (const pattern of titlePatterns) {
          const match = result.content.match(pattern);
          if (match && match[1]) {
            titulo = match[1].trim();
            console.log("Título extraído:", titulo);
            break;
          }
        }
        
        // Se não conseguiu extrair um título, use um com base no conteúdo
        if (!titulo || titulo === "E-book Personalizado") {
          if (formData.detalhes.toLowerCase().includes("vegetariana")) {
            titulo = "Delícias Vegetarianas";
          } else if (formData.detalhes.toLowerCase().includes("vegana")) {
            titulo = "Cardápio Vegano";
          } else if (formData.detalhes.toLowerCase().includes("café da manhã")) {
            titulo = "Café da Manhã Saudável";
          } else if (formData.detalhes.toLowerCase().includes("jantar")) {
            titulo = "Jantares Nutritivos";
          } else if (formData.detalhes.toLowerCase().includes("low carb")) {
            titulo = "Receitas Low Carb";
          } else {
            titulo = "Alimentação Saudável";
          }
          console.log("Usando título padrão:", titulo);
        }
        
        setEbookGerado({
          titulo: titulo,
          conteudo: result.content
        });
        
        setFormSubmitted(true);
      } else {
        console.error("Erro ao gerar e-book, nenhum conteúdo retornado");
        setRequestError("Não foi possível gerar o e-book. Por favor, tente novamente ou use uma descrição mais simples.");
        toast.error("Erro ao gerar o e-book. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar e-book:", error);
      setRequestError("Ocorreu um erro técnico. Por favor, tente novamente mais tarde.");
      toast.error("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.detalhes.trim() !== "";
  };

  // Função para baixar o e-book como PDF
  const handleDownloadEbook = () => {
    try {
      // Criando um novo documento PDF
      const pdf = new jsPDF();
      
      // Adicionando título
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(ebookGerado.titulo, 20, 20);
      
      // Configurando tamanho de fonte para o conteúdo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Quebrando o texto em linhas para caber na página
      const splitContent = pdf.splitTextToSize(ebookGerado.conteudo, 170);
      
      // Conteúdo pode ser muito longo, precisamos verificar e adicionar páginas, se necessário
      let yPosition = 30;
      const lineHeight = 7;
      
      for (let i = 0; i < splitContent.length; i++) {
        // Se a posição y atual exceder a altura da página (menos uma margem de 20)
        if (yPosition + lineHeight > pdf.internal.pageSize.height - 20) {
          // Adicionar uma nova página
          pdf.addPage();
          yPosition = 20; // Resetar a posição Y no topo da nova página (com margem)
        }
        
        // Adicionar a linha na posição atual
        pdf.text(splitContent[i], 20, yPosition);
        // Incrementar a posição Y para a próxima linha
        yPosition += lineHeight;
      }
      
      // Salvando o PDF com nome baseado no título
      const fileName = `${ebookGerado.titulo.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast.success("E-book baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao baixar o e-book. Por favor, tente novamente.");
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
            <BookOpen className="h-6 w-6 mr-2 text-primary" />
            Criar E-book Personalizado
          </h1>
        </div>

        {!formSubmitted ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Detalhe o conteúdo desejado para seu e-book de receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="detalhes" className="text-base font-medium block mb-3">
                    O que você gostaria de incluir no seu e-book?
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Por exemplo: tipo de receitas, temas específicos, restrições alimentares, 
                    <strong> quantidade de receitas</strong>, se quer incluir informações nutricionais, etc.
                  </p>
                  <Textarea
                    id="detalhes"
                    placeholder="Ex: Gostaria de um e-book com 20 receitas vegetarianas para o café da manhã, com informações nutricionais e que sejam rápidas de preparar..."
                    value={formData.detalhes}
                    onChange={(e) => handleChange(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                {requestError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>
                      {requestError}
                    </AlertDescription>
                  </Alert>
                )}

                <CardFooter className="px-0 pt-6">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={!isFormValid() || isLoading} 
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando seu E-book...
                      </>
                    ) : (
                      <>
                        <BookOpen className="mr-2 h-5 w-5" />
                        Criar Meu E-book
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-2xl flex items-center text-primary">
                <Check className="mr-2 h-6 w-6" />
                Seu E-book Personalizado está Pronto!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
                  <div className="h-48 bg-accent/50 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-16 w-16 mx-auto text-accent-foreground/70 mb-2" />
                      <h3 className="font-bold text-lg">{ebookGerado.titulo}</h3>
                      <p className="text-sm">E-book Personalizado</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary">
                      {ebookGerado.titulo}
                    </h3>
                    
                    <p className="mt-2 text-sm line-clamp-4 text-muted-foreground">
                      Baseado na sua solicitação, preparamos um e-book com receitas saudáveis,
                      nutritivas e personalizadas de acordo com suas preferências.
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="bg-accent px-2 py-1 rounded-md text-xs">
                        {formData.detalhes.match(/\d+/) ? formData.detalhes.match(/\d+/)[0] : "10"} receitas
                      </span>
                      <span className="text-muted-foreground">PDF - 4.2 MB</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border overflow-auto max-h-[500px]">
                  <h3 className="text-lg font-medium mb-3">Conteúdo do E-book</h3>
                  <div className="whitespace-pre-line text-sm">
                    {ebookGerado.conteudo || "Nenhum conteúdo disponível."}
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setFormSubmitted(false)} variant="outline">
                    Modificar E-book
                  </Button>
                  <Button className="bg-primary" onClick={handleDownloadEbook}>
                    <FileText className="mr-2 h-4 w-4" />
                    Baixar E-book
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EbookPersonalizado;

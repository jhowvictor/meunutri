
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check,
  Download,
  Loader2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";

const ListaCompras = () => {
  const [formData, setFormData] = useState({
    detalhes: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listaGerada, setListaGerada] = useState({
    titulo: "",
    conteudo: ""
  });

  const handleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      detalhes: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se a chave da API está configurada
    if (!openAIService.getApiKey()) {
      toast.error("Por favor, configure sua chave da API OpenAI primeiro.");
      return;
    }
    
    setIsLoading(true);
    
    // Construir o prompt para a API
    const prompt = `
      Por favor, crie uma lista de compras organizada com base nas seguintes especificações:
      
      ${formData.detalhes}
      
      Forneça:
      1. Um título para a lista de compras
      2. Uma lista organizada por categorias (ex: frutas, vegetais, proteínas, etc.)
      3. Quantidade estimada de cada item
      4. Se possível, sugestão de onde comprar os itens mais específicos
    `;
    
    try {
      const result = await openAIService.generateContent({
        prompt: prompt,
        max_tokens: 1500
      });
      
      if (!result.isError && result.content) {
        // Tenta extrair o título da resposta
        let titulo = "Lista de Compras";
        const tituloMatch = result.content.match(/(?:Título|Lista):\s*([^\n]+)/i);
        if (tituloMatch && tituloMatch[1]) {
          titulo = tituloMatch[1].trim();
        }
        
        setListaGerada({
          titulo: titulo,
          conteudo: result.content
        });
        
        setFormSubmitted(true);
      } else {
        toast.error("Erro ao gerar a lista de compras. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar lista de compras:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.detalhes.trim() !== "";
  };

  // Função para baixar a lista como PDF
  const handleDownloadLista = () => {
    try {
      // Criando um novo documento PDF
      const pdf = new jsPDF();
      
      // Adicionando título
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(listaGerada.titulo, 20, 20);
      
      // Configurando tamanho de fonte para o conteúdo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Quebrando o texto em linhas para caber na página
      const splitContent = pdf.splitTextToSize(listaGerada.conteudo, 170);
      
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
      const fileName = `${listaGerada.titulo.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast.success("Lista de compras baixada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao baixar a lista. Por favor, tente novamente.");
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
            <ShoppingCart className="h-6 w-6 mr-2 text-primary" />
            Criar Lista de Compras
          </h1>
        </div>

        {!formSubmitted ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Descreva os itens que você precisa para sua lista de compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="detalhes" className="text-base font-medium block mb-3">
                    O que você gostaria de incluir na sua lista?
                  </Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Por exemplo: ingredientes para receitas específicas, itens para a semana, 
                    produtos para dieta específica, etc.
                  </p>
                  <Textarea
                    id="detalhes"
                    placeholder="Ex: Preciso de ingredientes para fazer um jantar italiano para 4 pessoas, incluindo entrada, prato principal e sobremesa..."
                    value={formData.detalhes}
                    onChange={(e) => handleChange(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

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
                        Criando sua lista...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Criar minha lista
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
                Sua Lista de Compras está Pronta!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
                  <div className="h-48 bg-accent/50 flex items-center justify-center">
                    <div className="text-center">
                      <ShoppingCart className="h-16 w-16 mx-auto text-accent-foreground/70 mb-2" />
                      <h3 className="font-bold text-lg">{listaGerada.titulo}</h3>
                      <p className="text-sm">Lista de Compras Personalizada</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary">
                      {listaGerada.titulo}
                    </h3>
                    
                    <p className="mt-2 text-sm line-clamp-4 text-muted-foreground">
                      Baseado na sua solicitação, preparamos uma lista de compras organizada
                      para ajudar você a não esquecer nenhum item necessário.
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="bg-accent px-2 py-1 rounded-md text-xs">
                        Lista Personalizada
                      </span>
                      <span className="text-muted-foreground">PDF</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium mb-3">Conteúdo da Lista</h3>
                  <div className="whitespace-pre-line text-sm">
                    {listaGerada.conteudo}
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setFormSubmitted(false)} variant="outline">
                    Modificar Lista
                  </Button>
                  <Button className="bg-primary" onClick={handleDownloadLista}>
                    <FileText className="mr-2 h-4 w-4" />
                    Baixar Lista
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

export default ListaCompras;


import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";
import { useLanguage } from "@/hooks/use-language";

const AnalisarRefeicao = () => {
  const { t } = useLanguage();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é um arquivo de mídia válido
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem ou vídeo.");
      return;
    }

    // Verificar se é um vídeo e se está dentro do limite de 30 segundos
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          toast.error("O vídeo deve ter no máximo 30 segundos.");
          return;
        } else {
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
          setIsVideo(true);
        }
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      // É uma imagem
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setIsVideo(false);
    }
  };

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const analyzeMedia = async () => {
    if (!mediaFile) {
      toast.error("Por favor, selecione uma imagem ou vídeo primeiro.");
      return;
    }

    setIsLoading(true);
    setAnalysis("");

    try {
      // Convertendo a mídia para base64
      const base64 = await convertFileToBase64(mediaFile);
      
      // Preparando o prompt para a IA
      const prompt = `
        Você é um nutricionista e chef funcional com conhecimento técnico em análise visual de alimentos.

        Analise a seguinte ${isVideo ? 'imagens do vídeo' : 'imagem'} de uma refeição e faça:

        1. Identifique os ingredientes principais visíveis.
        2. Estime os macronutrientes da refeição (carboidratos, proteínas e gorduras e calorias totais), com base na porção visível.
        3. Classifique a refeição nas seguintes categorias (se aplicável): Vegana, Vegetariana, Sem glúten, Sem lactose, Apta para diabéticos.
        4. Dê uma breve explicação da análise, de forma clara e acessível.
        5. Sugira uma forma de melhorar a refeição para torná-la mais saudável, equilibrada ou funcional.

        Se não conseguir identificar claramente os itens ou houver baixa qualidade de imagem, peça gentilmente uma nova imagem com mais nitidez e boa iluminação.
        
        Imagem: ${base64}
      `;

      // Enviando para o serviço da OpenAI
      const result = await openAIService.generateContent({
        prompt,
        model: "gpt-4o", // Modelo com capacidade de visão
        temperature: 0.7,
        max_tokens: 1000
      });

      if (result.isError) {
        throw new Error("Erro ao analisar a imagem");
      }

      setAnalysis(result.content);
    } catch (error) {
      console.error("Erro na análise:", error);
      toast.error("Ocorreu um erro ao analisar sua refeição. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resetAnalysis = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setAnalysis("");
    setIsVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary text-center">Analisar Minha Refeição</h1>
      <p className="text-center text-muted-foreground mb-8">
        Envie uma foto ou um vídeo curto (máx. 30 segundos) da sua refeição para receber uma análise nutricional.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Enviar Mídia</h2>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />

            {!mediaPreview ? (
              <div 
                className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={handleCaptureClick}
              >
                <Camera className="h-12 w-12 mx-auto text-primary mb-2" />
                <p>Clique para capturar ou fazer upload</p>
                <p className="text-sm text-muted-foreground mt-2">Formatos suportados: JPG, PNG, GIF, MP4, MOV</p>
              </div>
            ) : (
              <div className="relative">
                {isVideo ? (
                  <video 
                    ref={videoRef}
                    src={mediaPreview} 
                    className="w-full h-auto rounded-lg" 
                    controls 
                    muted 
                  />
                ) : (
                  <img 
                    src={mediaPreview} 
                    alt="Preview da refeição" 
                    className="w-full h-auto rounded-lg"
                  />
                )}
                
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={resetAnalysis}>
                    Escolher outra mídia
                  </Button>
                  <Button 
                    onClick={analyzeMedia} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analisar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Resultado da Análise</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p>Analisando sua refeição...</p>
                <p className="text-sm text-muted-foreground mt-2">Isso pode levar alguns segundos.</p>
              </div>
            ) : analysis ? (
              <div className="prose prose-sm max-w-none">
                <Textarea 
                  className="h-[350px] font-normal text-base" 
                  value={analysis}
                  readOnly
                />
              </div>
            ) : (
              <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
                <p>A análise da sua refeição aparecerá aqui após o processamento.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalisarRefeicao;

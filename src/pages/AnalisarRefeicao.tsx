import { useState, useRef } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";
import { useLanguage } from "@/hooks/use-language";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AnalisarRefeicao = () => {
  const { t } = useLanguage();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [errorDialog, setErrorDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem ou vídeo.");
      return;
    }

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
      console.log("Iniciando análise de mídia...");
      const base64 = await convertFileToBase64(mediaFile);
      console.log("Mídia convertida para base64");
      
      const prompt = `
        Você é um nutricionista e chef funcional com conhecimento técnico em análise visual de alimentos.

        Analise a seguinte ${isVideo ? 'imagens do vídeo' : 'imagem'} de uma refeição e forneça as seguintes informações de forma ESTRUTURADA:

        1. Identifique os ingredientes principais visíveis na refeição.
        
        2. Estime os macronutrientes da refeição:
           - Carboidratos (em gramas)
           - Proteínas (em gramas)
           - Gorduras (em gramas)
           - Calorias totais (kcal)
        
        3. Classifique a refeição nas seguintes categorias com SIM ou NÃO:
           - Vegana: (SIM/NÃO)
           - Vegetariana: (SIM/NÃO)
           - Sem glúten: (SIM/NÃO)
           - Sem lactose: (SIM/NÃO)
           - Apta para diabéticos: (SIM/NÃO)
        
        4. Dê uma breve explicação da análise, de forma clara e acessível.
        
        5. Sugira uma forma de melhorar a refeição para torná-la mais saudável, equilibrada ou funcional.

        IMPORTANTE: Mantenha a formatação clara com títulos e listas. Se não conseguir identificar claramente os itens ou houver baixa qualidade de imagem, peça gentilmente uma nova imagem com mais nitidez e boa iluminação.
        
        MUITO IMPORTANTE: Você DEVE apresentar os macronutrientes (carboidratos, proteínas e gorduras) em gramas e as calorias totais em kcal, mesmo que seja uma estimativa.
      `;

      console.log("Enviando prompt para o serviço OpenAI");
      const result = await openAIService.generateContent({
        prompt,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 1000
      });

      console.log("Resposta recebida do serviço OpenAI:", result);

      if (result.isError) {
        throw new Error("Erro ao analisar a imagem");
      }

      setAnalysis(result.content);
    } catch (error) {
      console.error("Erro na análise:", error);
      setErrorMessage("Ocorreu um erro ao analisar sua refeição. Por favor, tente novamente.");
      setErrorDialog(true);
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

  const capturePhoto = async () => {
    try {
      if (!('mediaDevices' in navigator)) {
        toast.error("Seu dispositivo não suporta captura de imagens.");
        return;
      }

      const video = document.createElement('video');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment'
        } 
      });
      
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
          setIsVideo(false);
        }
      }, 'image/jpeg');

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Erro ao capturar foto. Por favor, tente novamente.");
    }
  };

  const handleMediaCapture = () => {
    const dialogContent = (
      <div className="p-4 flex flex-col gap-4">
        <Button 
          onClick={capturePhoto}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Tirar Foto
        </Button>
        <Button 
          onClick={handleCaptureClick}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Enviar da Galeria
        </Button>
      </div>
    );

    Dialog.show({
      title: "Escolha uma opção",
      content: dialogContent,
      className: "sm:max-w-[425px]"
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary text-center">Analisar Minha Refeição</h1>
      <p className="text-center text-muted-foreground mb-8">
        Tire uma foto ou envie uma imagem da sua refeição para receber uma análise nutricional.
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
                onClick={handleMediaCapture}
              >
                <Camera className="h-12 w-12 mx-auto text-primary mb-2" />
                <p>Clique para capturar ou fazer upload</p>
                <p className="text-sm text-muted-foreground mt-2">Tire uma foto ou escolha da galeria</p>
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

      <Dialog open={errorDialog} onOpenChange={setErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro na Análise</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{errorMessage}</p>
            <p className="mt-2">Dicas para resolver:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Verifique se a imagem é clara e bem iluminada</li>
              <li>Tente uma imagem de ângulo diferente</li>
              <li>Certifique-se de que o alimento está visível</li>
              <li>Verifique sua conexão com a internet</li>
            </ul>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDialog(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisarRefeicao;

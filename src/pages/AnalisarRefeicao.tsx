import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Upload, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { openAIService } from "@/services/openai";
import SaveToLibrary from "@/components/SaveToLibrary";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

const AnalisarRefeicao = () => {
  const { user } = useAuth();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [errorDialog, setErrorDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showMediaDialog, setShowMediaDialog] = useState<boolean>(false);
  const [showCameraPreview, setShowCameraPreview] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraPreviewRef = useRef<HTMLVideoElement>(null);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
    setErrorMessage("");

    try {
      console.log("Iniciando análise de mídia...");
      const base64 = await convertFileToBase64(mediaFile);
      console.log("Mídia convertida para base64, tamanho:", base64.length);
      
      if (!base64 || base64.length < 100) {
        throw new Error("A imagem não pôde ser processada corretamente. Tente novamente com outra imagem.");
      }
      
      const prompt = `
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
      const result = await openAIService.generateContentWithVision({
        base64Image: base64,
        prompt: prompt,
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 1000
      });

      console.log("Resposta recebida do serviço OpenAI:", !result.isError ? "Sucesso" : "Erro");

      if (result.isError) {
        throw new Error(result.content || "Erro ao analisar a imagem.");
      }

      if (!result.content) {
        throw new Error("A API retornou uma resposta vazia. Por favor, tente novamente.");
      }

      setAnalysis(result.content);

      // Persist meal log
      if (user) {
        const cal = result.content.match(/(\d{2,5})\s*kcal/i)?.[1];
        const carbs = result.content.match(/Carboidratos[^\d]*(\d+(?:[.,]\d+)?)/i)?.[1]?.replace(",", ".");
        const prot = result.content.match(/Prote[ií]nas[^\d]*(\d+(?:[.,]\d+)?)/i)?.[1]?.replace(",", ".");
        const fat = result.content.match(/Gorduras[^\d]*(\d+(?:[.,]\d+)?)/i)?.[1]?.replace(",", ".");
        await (supabase as any).from("meal_logs").insert({
          user_id: user.id,
          analysis: result.content,
          calories: cal ? parseInt(cal) : null,
          carbs_g: carbs ? parseFloat(carbs) : null,
          protein_g: prot ? parseFloat(prot) : null,
          fat_g: fat ? parseFloat(fat) : null,
        });
      }
    } catch (error) {
      console.error("Erro na análise:", error);
      const errorMsg = error instanceof Error ? error.message : "Ocorreu um erro ao analisar sua refeição.";
      setErrorMessage(errorMsg);
      setErrorDialog(true);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try {
          const base64 = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        } catch (error) {
          console.error("Erro ao converter arquivo para base64:", error);
          reject("Falha ao processar a imagem. Por favor, tente novamente.");
        }
      };
      reader.onerror = error => {
        console.error("Erro na leitura do arquivo:", error);
        reject(error);
      };
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

  // Start camera preview for user to choose the angle
  const startCameraPreview = async () => {
    try {
      if (!('mediaDevices' in navigator)) {
        toast.error("Seu dispositivo não suporta captura de imagens.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      cameraStreamRef.current = stream;
      
      // Show camera preview dialog
      setShowCameraPreview(true);
      
      // Wait for the dialog to render and the video element to be available
      setTimeout(() => {
        if (cameraPreviewRef.current) {
          cameraPreviewRef.current.srcObject = stream;
          cameraPreviewRef.current.play().catch(err => {
            console.error("Error playing camera preview:", err);
            toast.error("Erro ao iniciar a câmera. Por favor, tente novamente.");
          });
        }
      }, 100);
    } catch (error) {
      console.error("Error starting camera preview:", error);
      toast.error("Erro ao iniciar a câmera. Por favor, verifique as permissões e tente novamente.");
    }
  };

  // Capture photo from preview
  const capturePhotoFromPreview = () => {
    try {
      if (!cameraPreviewRef.current) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = cameraPreviewRef.current.videoWidth;
      canvas.height = cameraPreviewRef.current.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(cameraPreviewRef.current, 0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          setMediaFile(file);
          setMediaPreview(URL.createObjectURL(file));
          setIsVideo(false);
        }
        
        // Stop camera and close dialog
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
          cameraStreamRef.current = null;
        }
        setShowCameraPreview(false);
        setShowMediaDialog(false);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Erro ao capturar foto. Por favor, tente novamente.");
      
      // Ensure camera is stopped even on error
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
      setShowCameraPreview(false);
    }
  };

  // Close camera preview
  const closeCameraPreview = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraPreview(false);
  };

  const handleMediaCapture = () => {
    setShowMediaDialog(true);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-primary">Analisar Minha Refeição</h1>
      </div>
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
                    variant="default"
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
              <div className="prose prose-sm max-w-none space-y-3">
                <Textarea 
                  className="h-[300px] font-normal text-base overflow-y-auto whitespace-pre-wrap" 
                  value={analysis}
                  readOnly
                />
                <SaveToLibrary
                  contentType="analise_refeicao"
                  title="Análise de Refeição"
                  content={analysis}
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

      {/* Media Selection Dialog */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escolha uma opção</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col gap-4">
            <Button 
              onClick={startCameraPreview}
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
        </DialogContent>
      </Dialog>

      {/* Camera Preview Dialog */}
      <Dialog 
        open={showCameraPreview} 
        onOpenChange={(open) => {
          if (!open) closeCameraPreview();
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Posicione a câmera</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex flex-col gap-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={cameraPreviewRef}
                autoPlay 
                playsInline
                className="w-full h-auto" 
              />
            </div>
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline"
                onClick={closeCameraPreview}
              >
                Cancelar
              </Button>
              <Button 
                onClick={capturePhotoFromPreview}
              >
                Capturar Foto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
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


import { useState } from "react";
import { Dumbbell, FileDown, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { openAIService } from "@/services/openai";
import { useLanguage } from "@/hooks/use-language";
import jsPDF from "jspdf";

// Define types for workout form
interface WorkoutFormData {
  objetivo: string;
  frequencia: string;
  nivel: string;
  foco: string;
  cardio: string;
}

const MontarTreino = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<WorkoutFormData>({
    objetivo: "",
    frequencia: "",
    nivel: "",
    foco: "",
    cardio: "",
  });
  
  const [workoutPlan, setWorkoutPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedWorkoutPlan, setEditedWorkoutPlan] = useState<string>("");

  const handleChange = (field: keyof WorkoutFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormComplete = () => {
    return Object.values(formData).every((value) => value.trim() !== "");
  };

  const generateWorkoutPlan = async () => {
    setIsLoading(true);
    
    try {
      const prompt = `
        Crie um plano de treino personalizado com base nas seguintes informações:
        
        Objetivo: ${formData.objetivo}
        Frequência semanal de treino: ${formData.frequencia} vezes por semana
        Nível atual: ${formData.nivel}
        Foco desejado nos treinos: ${formData.foco}
        Deseja incluir cardio: ${formData.cardio}
        
        Por favor, forneça um plano de treino detalhado com:
        - Divisão dos treinos por dias da semana
        - Exercícios específicos para cada dia
        - Séries e repetições para cada exercício
        - Tempo estimado para cada sessão
        - Dicas de execução e motivação
        
        O plano deve ser adaptado ao nível da pessoa, com linguagem clara, objetiva e motivadora.
        ${formData.nivel === "iniciante" ? "Como a pessoa é iniciante, foque em exercícios mais simples e seguros para adaptação." : ""}
        
        Formate o plano de forma organizada, usando subtítulos e marcadores para facilitar a leitura.
      `;
      
      const response = await openAIService.generateContent({ prompt });
      
      if (!response.isError) {
        setWorkoutPlan(response.content);
        setEditedWorkoutPlan(response.content);
        toast({
          title: "Plano de treino criado com sucesso!",
          description: "Seu plano de treino personalizado está pronto.",
        });
      } else {
        toast({
          title: "Erro ao gerar plano de treino",
          description: "Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar plano de treino:", error);
      toast({
        title: "Erro ao gerar plano de treino",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text("MeuNutri.AI - Plano de Treino Personalizado", 20, 20);
      
      // Add workout plan content
      doc.setFontSize(12);
      
      // Split text to fit in PDF
      const contentToUse = isEditing ? editedWorkoutPlan : workoutPlan;
      const splitText = doc.splitTextToSize(contentToUse, 170);
      
      doc.text(splitText, 20, 40);
      
      // Add footer
      doc.setFontSize(10);
      doc.text("© MeuNutri.AI - Gerado em " + new Date().toLocaleDateString(), 20, 280);
      
      // Save PDF
      doc.save("MeuNutri_Plano_Treino.pdf");
      
      toast({
        title: "PDF baixado com sucesso!",
        description: "Seu plano de treino foi salvo como PDF.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao baixar PDF",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const saveEditedPlan = () => {
    setWorkoutPlan(editedWorkoutPlan);
    setIsEditing(false);
    toast({
      title: "Plano de treino atualizado!",
      description: "Suas alterações foram salvas.",
    });
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Montar meu Treino</h1>
        </div>
        <p className="text-muted-foreground">
          Crie um plano de treino personalizado com base nas suas necessidades e objetivos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações para o Treino</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para criarmos seu treino personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Qual seu objetivo principal?</Label>
              <RadioGroup 
                value={formData.objetivo}
                onValueChange={(value) => handleChange("objetivo", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="emagrecer" id="emagrecer" />
                  <Label htmlFor="emagrecer">Emagrecer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ganhar massa muscular" id="massa" />
                  <Label htmlFor="massa">Ganhar massa muscular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manutenção da saúde" id="saude" />
                  <Label htmlFor="saude">Manutenção da saúde</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência semanal de treino</Label>
              <Select 
                onValueChange={(value) => handleChange("frequencia", value)}
              >
                <SelectTrigger id="frequencia">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent position="popper" className="w-full bg-popover border border-border">
                  <SelectItem value="1">1 vez por semana</SelectItem>
                  <SelectItem value="2">2 vezes por semana</SelectItem>
                  <SelectItem value="3">3 vezes por semana</SelectItem>
                  <SelectItem value="4">4 vezes por semana</SelectItem>
                  <SelectItem value="5">5 vezes por semana</SelectItem>
                  <SelectItem value="6">6 vezes por semana</SelectItem>
                  <SelectItem value="7">7 vezes por semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Qual seu nível atual?</Label>
              <RadioGroup 
                value={formData.nivel}
                onValueChange={(value) => handleChange("nivel", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="iniciante" id="iniciante" />
                  <Label htmlFor="iniciante">Iniciante/Sedentário</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediario" id="intermediario" />
                  <Label htmlFor="intermediario">Intermediário (já treino)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="avancado" id="avancado" />
                  <Label htmlFor="avancado">Avançado (treino há bastante tempo)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foco">Foco desejado nos treinos</Label>
              <Select 
                onValueChange={(value) => handleChange("foco", value)}
              >
                <SelectTrigger id="foco">
                  <SelectValue placeholder="Selecione o foco principal" />
                </SelectTrigger>
                <SelectContent position="popper" className="w-full bg-popover border border-border">
                  <SelectItem value="corpo inteiro">Corpo inteiro</SelectItem>
                  <SelectItem value="pernas">Pernas</SelectItem>
                  <SelectItem value="abdômen">Abdômen</SelectItem>
                  <SelectItem value="costas">Costas</SelectItem>
                  <SelectItem value="peito">Peito</SelectItem>
                  <SelectItem value="braços">Braços</SelectItem>
                  <SelectItem value="glúteos">Glúteos</SelectItem>
                  <SelectItem value="resistência">Resistência</SelectItem>
                  <SelectItem value="força">Força</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deseja incluir cardio?</Label>
              <RadioGroup 
                value={formData.cardio}
                onValueChange={(value) => handleChange("cardio", value)}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id="cardio-sim" />
                  <Label htmlFor="cardio-sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="não" id="cardio-nao" />
                  <Label htmlFor="cardio-nao">Não</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={generateWorkoutPlan} 
              disabled={!isFormComplete() || isLoading}
            >
              {isLoading ? "Gerando treino..." : "Criar Meu Treino"}
            </Button>
          </CardContent>
        </Card>

        {workoutPlan && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Seu Plano de Treino</CardTitle>
                <CardDescription>
                  Plano personalizado baseado nas suas informações
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <Button size="sm" variant="outline" onClick={saveEditedPlan}>
                    <Check className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={downloadAsPDF}>
                  <FileDown className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={editedWorkoutPlan}
                  onChange={(e) => setEditedWorkoutPlan(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{workoutPlan}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MontarTreino;

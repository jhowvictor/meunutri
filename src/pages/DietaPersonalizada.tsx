
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ChefHat, 
  Calendar, 
  Check,
  Activity, 
  Scale,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";

const DietaPersonalizada = () => {
  const [formData, setFormData] = useState({
    tipoAlimentacao: "",
    altura: "",
    restricoesAlimentares: "",
    peso: "",
    genero: "",
    objetivo: "",
    exercicios: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dietaGerada, setDietaGerada] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
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
      Por favor, crie um plano alimentar personalizado com as seguintes características:
      
      Tipo de Alimentação: ${formData.tipoAlimentacao}
      Altura: ${formData.altura} cm
      Restrições Alimentares: ${formData.restricoesAlimentares || "Nenhuma"}
      Peso: ${formData.peso} kg
      Gênero: ${formData.genero}
      Objetivo: ${formData.objetivo}
      Nível de Atividade Física: ${formData.exercicios}
      
      Forneça um plano alimentar completo com café da manhã, lanche da manhã, almoço, lanche da tarde e jantar.
      Para cada refeição, inclua as opções de alimentos, quantidades aproximadas e informações nutricionais.
      Inclua também recomendações gerais sobre o plano e como seguir a dieta.
    `;
    
    try {
      const result = await openAIService.generateContent({ prompt });
      
      if (!result.isError && result.content) {
        setDietaGerada(result.content);
        setFormSubmitted(true);
      } else {
        toast.error("Erro ao gerar a dieta. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar dieta:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    // Verifica se todos os campos obrigatórios estão preenchidos
    return Object.values(formData).every(value => value !== "");
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
            <ChefHat className="h-6 w-6 mr-2 text-primary" />
            Solicitar Dieta Personalizada
          </h1>
        </div>

        {!formSubmitted ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">
                Preencha seus dados para receber um plano alimentar personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Alimentação */}
                <div>
                  <Label className="text-base font-medium block mb-3">1. Tipo de Alimentação</Label>
                  <RadioGroup 
                    value={formData.tipoAlimentacao} 
                    onValueChange={(value) => handleChange('tipoAlimentacao', value)}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {['Vegana', 'Vegetariana', 'Sem Glúten', 'Sem Lactose', 'Para Diabéticos', 'Low Carb'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <RadioGroupItem value={item} id={`tipo-${item}`} />
                        <Label htmlFor={`tipo-${item}`} className="cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Altura */}
                <div>
                  <Label htmlFor="altura" className="text-base font-medium block mb-3">
                    2. Altura (em centímetros)
                  </Label>
                  <Input
                    id="altura"
                    type="number"
                    placeholder="Ex: 170"
                    value={formData.altura}
                    onChange={(e) => handleChange('altura', e.target.value)}
                  />
                </div>

                {/* Restrições Alimentares */}
                <div>
                  <Label htmlFor="restricoes" className="text-base font-medium block mb-3">
                    3. Restrições Alimentares
                  </Label>
                  <Input
                    id="restricoes"
                    placeholder="Ex: alergia a amendoim, intolerância à lactose..."
                    value={formData.restricoesAlimentares}
                    onChange={(e) => handleChange('restricoesAlimentares', e.target.value)}
                  />
                </div>

                {/* Peso */}
                <div>
                  <Label htmlFor="peso" className="text-base font-medium block mb-3">
                    4. Peso (em kg)
                  </Label>
                  <Input
                    id="peso"
                    type="number"
                    placeholder="Ex: 70"
                    value={formData.peso}
                    onChange={(e) => handleChange('peso', e.target.value)}
                  />
                </div>

                {/* Gênero */}
                <div>
                  <Label className="text-base font-medium block mb-3">5. Gênero</Label>
                  <RadioGroup 
                    value={formData.genero} 
                    onValueChange={(value) => handleChange('genero', value)}
                    className="flex gap-6"
                  >
                    {['Masculino', 'Feminino'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <RadioGroupItem value={item} id={`genero-${item}`} />
                        <Label htmlFor={`genero-${item}`} className="cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Objetivo */}
                <div>
                  <Label className="text-base font-medium block mb-3">6. Objetivo</Label>
                  <RadioGroup 
                    value={formData.objetivo} 
                    onValueChange={(value) => handleChange('objetivo', value)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    {[
                      'Emagrecer', 
                      'Controlar Glicemia', 
                      'Ganhar Massa Muscular',
                      'Manutenção da Saúde'
                    ].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <RadioGroupItem value={item} id={`objetivo-${item}`} />
                        <Label htmlFor={`objetivo-${item}`} className="cursor-pointer">{item}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Exercícios */}
                <div>
                  <Label htmlFor="exercicios" className="text-base font-medium block mb-3">
                    7. Exercícios
                  </Label>
                  <Select 
                    value={formData.exercicios} 
                    onValueChange={(value) => handleChange('exercicios', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu nível de atividade física" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sedentário">Sedentário</SelectItem>
                      <SelectItem value="Treino Leve">Treino Leve</SelectItem>
                      <SelectItem value="Exercícios 3-5x semana">Exercícios de 3 a 5 vezes na semana</SelectItem>
                      <SelectItem value="Treino todo dia">Treino todo dia</SelectItem>
                    </SelectContent>
                  </Select>
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
                        Gerando Dieta...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-5 w-5" />
                        Gerar Dieta
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
                Sua Dieta Personalizada!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl">Plano Alimentar Personalizado</h3>
                      <p className="text-muted-foreground">
                        {formData.objetivo} | {formData.tipoAlimentacao}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-accent rounded text-sm flex items-center">
                        <Scale className="h-4 w-4 mr-1" />
                        {formData.peso}kg
                      </div>
                      <div className="px-3 py-1 bg-accent rounded text-sm flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        {formData.exercicios.includes("Exercícios") ? "Moderado" : formData.exercicios}
                      </div>
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-line text-sm mt-4">
                    {dietaGerada}
                  </div>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setFormSubmitted(false)} variant="outline">
                    Modificar Dieta
                  </Button>
                  <Link to="/">
                    <Button>Voltar ao Início</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DietaPersonalizada;

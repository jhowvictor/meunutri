
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Check,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EbookPersonalizado = () => {
  const [formData, setFormData] = useState({
    detalhes: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      detalhes: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const isFormValid = () => {
    return formData.detalhes.trim() !== "";
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
                    quantidade de receitas, se quer incluir informações nutricionais, etc.
                  </p>
                  <Textarea
                    id="detalhes"
                    placeholder="Ex: Gostaria de um e-book com 10 receitas vegetarianas para o café da manhã, com informações nutricionais e que sejam rápidas de preparar..."
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
                    disabled={!isFormValid()} 
                    className="w-full"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Criar meu E-book
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
                      <h3 className="font-bold text-lg">Receitas Saudáveis</h3>
                      <p className="text-sm">E-book Personalizado</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary">
                      {formData.detalhes.toLowerCase().includes("vegetariana") ? "Delícias Vegetarianas" :
                       formData.detalhes.toLowerCase().includes("vegana") ? "Cardápio Vegano" :
                       formData.detalhes.toLowerCase().includes("café da manhã") ? "Café da Manhã Saudável" :
                       formData.detalhes.toLowerCase().includes("jantar") ? "Jantares Nutritivos" :
                       formData.detalhes.toLowerCase().includes("low carb") ? "Receitas Low Carb" :
                       "Alimentação Saudável"}
                    </h3>
                    
                    <p className="mt-2 text-sm line-clamp-4 text-muted-foreground">
                      Baseado na sua solicitação, preparamos um e-book com receitas saudáveis,
                      nutritivas e personalizadas de acordo com suas preferências. Inclui informações
                      nutricionais, dicas de preparação e sugestões de substituições.
                    </p>
                    
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="bg-accent px-2 py-1 rounded-md text-xs">
                        {formData.detalhes.match(/\d+/) ? formData.detalhes.match(/\d+/)[0] : "10"} receitas
                      </span>
                      <span className="text-muted-foreground">PDF - 4.2 MB</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-muted-foreground">
                  Em um sistema real, aqui seria gerado um e-book completo com todas as receitas
                  personalizadas conforme suas solicitações!
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setFormSubmitted(false)} variant="outline">
                    Modificar E-book
                  </Button>
                  <Button className="bg-primary">
                    <Download className="mr-2 h-4 w-4" />
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

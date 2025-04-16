
import { Link } from "react-router-dom";
import { ChefHat, Utensils, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30">
      <div className="container max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Chef Saudável Digital</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Receitas e dietas personalizadas para uma alimentação saudável, funcional e totalmente adaptada às suas necessidades.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita Personalizada */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Utensils className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Receita Personalizada</CardTitle>
              <CardDescription>
                Crie receitas adaptadas às suas preferências e necessidades nutricionais
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/receita-personalizada">
                <Button className="w-full" size="lg">
                  Solicitar Receita Personalizada
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dieta Personalizada */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <ChefHat className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Dieta Personalizada</CardTitle>
              <CardDescription>
                Obtenha um plano alimentar completo baseado nos seus dados e objetivos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/dieta-personalizada">
                <Button className="w-full" size="lg">
                  Solicitar Dieta Personalizada
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* E-book Personalizado */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">E-book Personalizado</CardTitle>
              <CardDescription>
                Crie coletâneas de receitas em formato de e-book para usar quando quiser
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/ebook-personalizado">
                <Button className="w-full" size="lg">
                  Criar E-book Personalizado
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <footer className="text-center mt-16 text-muted-foreground text-sm">
          <p>© 2025 Chef Saudável Digital • Nutrição funcional & Receitas personalizadas</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;


import { ChefHat, Utensils, Camera, Calendar, BookOpen, TrendingUp, ShoppingCart, Dumbbell, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      {/* Circular decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl"></div>
      <div className="absolute top-1/4 right-0 w-40 h-40 rounded-full bg-secondary/20 blur-2xl"></div>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-28 xl:py-32 relative ">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center relative z-10">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full -z-10 animate-pulse-soft"></div>
              <div className="animate-float">
                <div className="rounded-full bg-gradient-to-br from-primary to-accent p-5 shadow-lg shadow-primary/20">
                  <ChefHat className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-fruit-gradient">
              MeuNutri.AI
            </h1>
          </div>
        </div>
      </section>

      {/* Feature Card Section */}
      <section className="container max-w-6xl px-4 py-8 mx-auto mb-20 ">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-fruit-gradient">Suas Ferramentas de Nutrição</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Crie receitas, dietas e muito mais com base nas suas preferências e objetivos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Receita Personalizada */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <Utensils className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Receita Personalizada</CardTitle>
              <CardDescription>
                Crie receitas adaptadas às suas preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/receita-personalizada">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Criar Receita
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analisar Refeição */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Analisar Refeição</CardTitle>
              <CardDescription>
                Analise suas refeições por foto
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/analisar-refeicao">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Analisar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dieta Personalizada */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Dieta Personalizada</CardTitle>
              <CardDescription>
                Receba um plano alimentar sob medida
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/dieta-personalizada">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Criar Dieta
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* E-book Personalizado */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">E-book Personalizado</CardTitle>
              <CardDescription>
                Crie seu e-book de receitas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/ebook-personalizado">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Criar E-book
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Evolução Corporal */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Evolução Corporal</CardTitle>
              <CardDescription>
                Acompanhe seu progresso
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/evolucao-corporal">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Ver Evolução
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Lista de Compras */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Lista de Compras</CardTitle>
              <CardDescription>
                Monte sua lista inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/lista-compras">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Criar Lista
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Montar Treino */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Montar Treino</CardTitle>
              <CardDescription>
                Crie seu plano de treino personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/montar-treino">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Criar Treino
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minha Biblioteca */}
          <Card className="border-border/30 bg-card/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <Library className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Minha Biblioteca</CardTitle>
              <CardDescription>
                Acesse seus conteúdos salvos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/minha-biblioteca">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Abrir Biblioteca
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-20 mb-8 text-center">
          <div className="mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent mb-6"></div>
          <p className="text-muted-foreground text-sm">© 2025 MeuNutri.AI • Nutrição funcional & Receitas personalizadas</p>
        </footer>
      </section>
    </div>
  );
};

export default Index;

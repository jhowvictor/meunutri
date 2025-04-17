
import { Link } from "react-router-dom";
import { ChefHat, Utensils, BookOpen, ShoppingCart, Star, Folder, Camera, LineChart, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      {/* Circular decorative elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl"></div>
      <div className="absolute top-1/4 right-0 w-40 h-40 rounded-full bg-secondary/20 blur-2xl"></div>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-28 xl:py-32 relative">
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
            <p className="max-w-[700px] text-lg md:text-xl text-foreground/80 mt-3 section-fade-in">
              {t("app_description", { default: "Receitas e dietas personalizadas para uma alimentação saudável, funcional e totalmente adaptada às suas necessidades." })}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button variant="fruit" size="xl" className="rounded-full font-semibold" asChild>
                <Link to="/receita-personalizada">Começar Agora</Link>
              </Button>
              <Button variant="outline" size="xl" className="rounded-full font-semibold">
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="container max-w-6xl px-4 py-8 mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-fruit-gradient">Personalize sua Alimentação</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Escolha entre nossas diversas opções para uma experiência nutricional personalizada</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita Personalizada */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <Utensils className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">{t("recipe_title", { default: "Receita Personalizada" })}</CardTitle>
              <CardDescription>
                {t("recipe_description", { default: "Crie receitas adaptadas às suas preferências e necessidades nutricionais" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/receita-personalizada">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  {t("request_recipe", { default: "Solicitar Receita" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dieta Personalizada */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">{t("diet_title", { default: "Dieta Personalizada" })}</CardTitle>
              <CardDescription>
                {t("diet_description", { default: "Obtenha um plano alimentar completo baseado nos seus dados e objetivos" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/dieta-personalizada">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  {t("request_diet", { default: "Solicitar Dieta" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* E-book Personalizado */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="mx-auto p-3 rounded-full fruit-gradient shadow-lg mb-2">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">{t("ebook_title", { default: "E-book Personalizado" })}</CardTitle>
              <CardDescription>
                {t("ebook_description", { default: "Crie coletâneas de receitas em formato de e-book para usar quando quiser" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/ebook-personalizado">
                <Button variant="fruit" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  {t("create_ebook", { default: "Criar E-book" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Lista de Compras */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-secondary/15 to-secondary/5">
              <div className="mx-auto p-3 rounded-full citrus-gradient shadow-lg mb-2">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">{t("shopping_list", { default: "Lista de Compras" })}</CardTitle>
              <CardDescription>
                {t("shopping_list_description", { default: "Gere uma lista de compras personalizada para suas necessidades culinárias" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/lista-compras">
                <Button variant="citrus" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  {t("create_shopping_list", { default: "Criar Lista" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Receitas Favoritas */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-secondary/15 to-secondary/5">
              <div className="mx-auto p-3 rounded-full citrus-gradient shadow-lg mb-2">
                <Star className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Receitas Favoritas</CardTitle>
              <CardDescription>
                Acesse suas receitas salvas como favoritas com facilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/receitas-favoritas">
                <Button variant="citrus" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Ver Favoritos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minhas Pastas */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-secondary/15 to-secondary/5">
              <div className="mx-auto p-3 rounded-full citrus-gradient shadow-lg mb-2">
                <Folder className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Minhas Pastas</CardTitle>
              <CardDescription>
                Organize suas receitas em pastas personalizadas por temas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/minhas-pastas">
                <Button variant="citrus" className="w-full btn-hover shadow-md rounded-full" size="lg">
                  Gerenciar Pastas
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analisar Refeição */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-accent/15 to-accent/5">
              <div className="mx-auto p-3 rounded-full green-gradient shadow-lg mb-2">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Analisar Refeição</CardTitle>
              <CardDescription>
                Envie foto ou vídeo da sua refeição para uma análise nutricional
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/analisar-refeicao">
                <Button variant="outline" className="w-full btn-hover shadow-md rounded-full border-accent/50 text-accent-foreground hover:bg-accent/10" size="lg">
                  Analisar Refeição
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minha Evolução Corporal */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-accent/15 to-accent/5">
              <div className="mx-auto p-3 rounded-full green-gradient shadow-lg mb-2">
                <LineChart className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Minha Evolução</CardTitle>
              <CardDescription>
                Registre e acompanhe suas medidas corporais com gráficos de evolução
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/evolucao-corporal">
                <Button variant="outline" className="w-full btn-hover shadow-md rounded-full border-accent/50 text-accent-foreground hover:bg-accent/10" size="lg">
                  Acompanhar Evolução
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Montar meu Treino */}
          <Card className="border-white/30 bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden card-hover fruit-card">
            <CardHeader className="text-center pb-2 bg-gradient-to-br from-accent/15 to-accent/5">
              <div className="mx-auto p-3 rounded-full green-gradient shadow-lg mb-2">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Montar meu Treino</CardTitle>
              <CardDescription>
                Crie um plano de treino personalizado baseado nos seus objetivos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-4">
              <Link to="/montar-treino">
                <Button variant="outline" className="w-full btn-hover shadow-md rounded-full border-accent/50 text-accent-foreground hover:bg-accent/10" size="lg">
                  Criar Meu Plano
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

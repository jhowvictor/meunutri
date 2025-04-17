
import { Link } from "react-router-dom";
import { ChefHat, Utensils, BookOpen, ShoppingCart, Star, Folder, Camera, LineChart, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/30 to-background">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full -z-10 animate-pulse"></div>
              <div className="floating-icon">
                <ChefHat className="h-20 w-20 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-gradient">
              MeuNutri.AI
            </h1>
            <p className="max-w-[700px] text-lg md:text-xl text-muted-foreground mt-2 section-fade-in">
              {t("app_description", { default: "Receitas e dietas personalizadas para uma alimentação saudável, funcional e totalmente adaptada às suas necessidades." })}
            </p>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="container max-w-6xl px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita Personalizada */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <Utensils className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("recipe_title", { default: "Receita Personalizada" })}</CardTitle>
              <CardDescription>
                {t("recipe_description", { default: "Crie receitas adaptadas às suas preferências e necessidades nutricionais" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/receita-personalizada">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  {t("request_recipe", { default: "Solicitar Receita Personalizada" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dieta Personalizada */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("diet_title", { default: "Dieta Personalizada" })}</CardTitle>
              <CardDescription>
                {t("diet_description", { default: "Obtenha um plano alimentar completo baseado nos seus dados e objetivos" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/dieta-personalizada">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  {t("request_diet", { default: "Solicitar Dieta Personalizada" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* E-book Personalizado */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("ebook_title", { default: "E-book Personalizado" })}</CardTitle>
              <CardDescription>
                {t("ebook_description", { default: "Crie coletâneas de receitas em formato de e-book para usar quando quiser" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/ebook-personalizado">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  {t("create_ebook", { default: "Criar E-book Personalizado" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Lista de Compras */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{t("shopping_list", { default: "Lista de Compras" })}</CardTitle>
              <CardDescription>
                {t("shopping_list_description", { default: "Gere uma lista de compras personalizada para suas necessidades culinárias" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/lista-compras">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  {t("create_shopping_list", { default: "Criar Lista de Compras" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Receitas Favoritas */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-accent/70 mb-2">
                <Star className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Receitas Favoritas</CardTitle>
              <CardDescription>
                Acesse suas receitas salvas como favoritas com facilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/receitas-favoritas">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  Ver Favoritos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minhas Pastas */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <Folder className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Minhas Pastas</CardTitle>
              <CardDescription>
                Organize suas receitas em pastas personalizadas por temas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/minhas-pastas">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  Gerenciar Pastas
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analisar Refeição */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Analisar Refeição</CardTitle>
              <CardDescription>
                Envie foto ou vídeo da sua refeição para uma análise nutricional
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/analisar-refeicao">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  Analisar minha refeição
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minha Evolução Corporal */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <LineChart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Minha Evolução Corporal</CardTitle>
              <CardDescription>
                Registre e acompanhe suas medidas corporais com gráficos de evolução
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/evolucao-corporal">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  Acompanhar Evolução
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Montar meu Treino */}
          <Card className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden card-hover">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 mb-2">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Montar meu Treino</CardTitle>
              <CardDescription>
                Crie um plano de treino personalizado baseado nos seus objetivos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/montar-treino">
                <Button className="w-full btn-hover shadow-md" size="lg">
                  Criar Meu Plano de Treino
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

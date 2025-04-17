
import { Link } from "react-router-dom";
import { ChefHat, Utensils, BookOpen, ShoppingCart, Star, Folder, Camera, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30">
      <div className="container max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ChefHat className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            MeuNutri.AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("app_description", { default: "Receitas e dietas personalizadas para uma alimentação saudável, funcional e totalmente adaptada às suas necessidades." })}
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita Personalizada */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Utensils className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">{t("recipe_title", { default: "Receita Personalizada" })}</CardTitle>
              <CardDescription>
                {t("recipe_description", { default: "Crie receitas adaptadas às suas preferências e necessidades nutricionais" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/receita-personalizada">
                <Button className="w-full" size="lg">
                  {t("request_recipe", { default: "Solicitar Receita Personalizada" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dieta Personalizada */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <ChefHat className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">{t("diet_title", { default: "Dieta Personalizada" })}</CardTitle>
              <CardDescription>
                {t("diet_description", { default: "Obtenha um plano alimentar completo baseado nos seus dados e objetivos" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/dieta-personalizada">
                <Button className="w-full" size="lg">
                  {t("request_diet", { default: "Solicitar Dieta Personalizada" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* E-book Personalizado */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">{t("ebook_title", { default: "E-book Personalizado" })}</CardTitle>
              <CardDescription>
                {t("ebook_description", { default: "Crie coletâneas de receitas em formato de e-book para usar quando quiser" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/ebook-personalizado">
                <Button className="w-full" size="lg">
                  {t("create_ebook", { default: "Criar E-book Personalizado" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Lista de Compras */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">{t("shopping_list", { default: "Lista de Compras" })}</CardTitle>
              <CardDescription>
                {t("shopping_list_description", { default: "Gere uma lista de compras personalizada para suas necessidades culinárias" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/lista-compras">
                <Button className="w-full" size="lg">
                  {t("create_shopping_list", { default: "Criar Lista de Compras" })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Receitas Favoritas */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Star className="h-12 w-12 mx-auto text-primary mb-2 fill-yellow-400" />
              <CardTitle className="text-xl">Receitas Favoritas</CardTitle>
              <CardDescription>
                Acesse suas receitas salvas como favoritas com facilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/receitas-favoritas">
                <Button className="w-full" size="lg">
                  Ver Favoritos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minhas Pastas */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Folder className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Minhas Pastas</CardTitle>
              <CardDescription>
                Organize suas receitas em pastas personalizadas por temas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/minhas-pastas">
                <Button className="w-full" size="lg">
                  Gerenciar Pastas
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analisar Refeição */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Camera className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Analisar Refeição</CardTitle>
              <CardDescription>
                Envie foto ou vídeo da sua refeição para uma análise nutricional
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/analisar-refeicao">
                <Button className="w-full" size="lg">
                  Analisar minha refeição (foto ou vídeo)
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Minha Evolução Corporal - NOVO */}
          <Card className="border-2 hover:border-primary/80 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <LineChart className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Minha Evolução Corporal</CardTitle>
              <CardDescription>
                Registre e acompanhe suas medidas corporais com gráficos de evolução
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <Link to="/evolucao-corporal">
                <Button className="w-full" size="lg">
                  Acompanhar Evolução
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <footer className="text-center mt-16 text-muted-foreground text-sm">
          <p>© 2025 MeuNutri.AI • Nutrição funcional & Receitas personalizadas</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

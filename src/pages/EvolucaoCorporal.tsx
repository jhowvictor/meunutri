
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ArrowLeft, 
  BarChart3, 
  ChevronRight, 
  Dumbbell, 
  Scale, 
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dados de exemplo para o gráfico
const weightData = [
  { date: 'Jan', weight: 81 },
  { date: 'Fev', weight: 80 },
  { date: 'Mar', weight: 78 },
  { date: 'Abr', weight: 76.5 },
  { date: 'Mai', weight: 74 },
  { date: 'Jun', weight: 73 },
];

// Componente principal
const EvolucaoCorporal = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-primary" />
          Evolução Corporal
        </h1>
      </div>

      {/* Seção de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          icon={<Scale className="h-5 w-5" />}
          title="Peso Atual"
          value="73 kg"
          trend="-2.5 kg"
          trendDirection="down"
        />
        <MetricCard 
          icon={<Activity className="h-5 w-5" />}
          title="IMC"
          value="22.5"
          trend="-0.7"
          trendDirection="down"
        />
        <MetricCard 
          icon={<BarChart3 className="h-5 w-5" />}
          title="% Gordura"
          value="18.3%"
          trend="-1.2%"
          trendDirection="down"
        />
        <MetricCard 
          icon={<Dumbbell className="h-5 w-5" />}
          title="Massa Muscular"
          value="31.2 kg"
          trend="+0.5 kg"
          trendDirection="up"
        />
      </div>

      {/* Gráfico de Evolução */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Evolução do Peso</CardTitle>
          <CardDescription>Acompanhamento nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weightData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value} kg`, 'Peso']}
                />
                <Area 
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cards de ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          icon={<Scale className="h-6 w-6" />}
          title="Registrar nova medição"
          description="Atualize suas medidas corporais para acompanhar seu progresso"
          buttonText="Registrar"
        />
        <ActionCard
          icon={<BarChart3 className="h-6 w-6" />}
          title="Analisar progresso"
          description="Compare seus resultados e veja sua evolução detalhada"
          buttonText="Analisar"
        />
      </div>
    </div>
  );
};

// Componentes auxiliares
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
}

const MetricCard = ({ icon, title, value, trend, trendDirection }: MetricCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground flex items-center">
            {icon}
          </span>
          <span 
            className={`text-xs px-2 py-1 rounded-full flex items-center ${
              trendDirection === 'down' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {trend}
          </span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  );
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
}

const ActionCard = ({ icon, title, description, buttonText }: ActionCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <Button className="w-full flex items-center justify-between">
          {buttonText}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EvolucaoCorporal;

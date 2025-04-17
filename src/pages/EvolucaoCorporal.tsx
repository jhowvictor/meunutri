
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { openAIService } from "@/services/openai";
import { Loader2, Calendar, PlusCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

// Tipos para os dados
interface BodyMeasurement {
  id: string;
  user_id: string;
  weight: number | null;
  height: number | null;
  waist: number | null;
  hip: number | null;
  arm: number | null;
  skin_fold: string | null;
  notes: string | null;
  measured_at: string;
  created_at: string;
}

// Definindo um tipo específico para goal_type
type GoalType = 'weight_loss' | 'muscle_gain' | 'glucose_control' | 'health_maintenance';

interface UserGoal {
  id: string;
  user_id: string;
  goal_type: GoalType;
  created_at: string;
  updated_at: string;
}

// Formulário para adicionar/editar medidas
interface MeasurementFormValues {
  weight: string;
  height: string;
  waist: string;
  hip: string;
  arm: string;
  skin_fold: string;
  notes: string;
  measured_at: string;
}

const goalTypes = [
  { value: 'weight_loss', label: 'Emagrecimento' },
  { value: 'muscle_gain', label: 'Ganho de Massa Muscular' },
  { value: 'glucose_control', label: 'Controle da Glicemia' },
  { value: 'health_maintenance', label: 'Manutenção da Saúde' }
];

const EvolucaoCorporal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [userGoal, setUserGoal] = useState<UserGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [activeChart, setActiveChart] = useState("weight");

  const form = useForm<MeasurementFormValues>({
    defaultValues: {
      weight: "",
      height: "",
      waist: "",
      hip: "",
      arm: "",
      skin_fold: "",
      notes: "",
      measured_at: format(new Date(), 'yyyy-MM-dd')
    }
  });

  // Buscar medidas e objetivo do usuário
  const fetchData = async () => {
    setLoading(true);
    try {
      if (!user) return;

      // Buscar medidas
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('body_measurements')
        .select('*')
        .order('measured_at', { ascending: true });

      if (measurementsError) throw new Error(measurementsError.message);
      setMeasurements(measurementsData || []);

      // Buscar objetivo do usuário
      const { data: goalData, error: goalError } = await supabase
        .from('user_goals')
        .select('*')
        .single();

      if (!goalError) {
        // Garantir que goal_type seja do tipo correto
        const typedGoalData = {
          ...goalData,
          goal_type: goalData.goal_type as GoalType
        };
        setUserGoal(typedGoalData);
      } else if (goalError.code !== 'PGRST116') { // Not found error
        throw new Error(goalError.message);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Salvar nova medida
  const onSubmit = async (values: MeasurementFormValues) => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Converter valores para número ou null
      const measurement = {
        user_id: user.id,
        weight: values.weight ? parseFloat(values.weight) : null,
        height: values.height ? parseFloat(values.height) : null,
        waist: values.waist ? parseFloat(values.waist) : null,
        hip: values.hip ? parseFloat(values.hip) : null,
        arm: values.arm ? parseFloat(values.arm) : null,
        skin_fold: values.skin_fold || null,
        notes: values.notes || null,
        measured_at: values.measured_at
      };

      const { error } = await supabase
        .from('body_measurements')
        .insert([measurement]);

      if (error) throw new Error(error.message);

      toast({
        title: "Sucesso!",
        description: "Medidas salvas com sucesso!"
      });

      form.reset({
        weight: "",
        height: "",
        waist: "",
        hip: "",
        arm: "",
        skin_fold: "",
        notes: "",
        measured_at: format(new Date(), 'yyyy-MM-dd')
      });

      fetchData();
      setIsDialogOpen(false);
      generateFeedback();
    } catch (error) {
      console.error("Erro ao salvar medida:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as medidas. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar ou atualizar objetivo
  const saveGoal = async (goalType: string) => {
    if (!user) return;
    
    try {
      // Validar que o goalType é do tipo correto
      if (!['weight_loss', 'muscle_gain', 'glucose_control', 'health_maintenance'].includes(goalType)) {
        throw new Error("Tipo de objetivo inválido");
      }
      
      const typedGoalType = goalType as GoalType;
      
      if (userGoal) {
        // Atualizar objetivo existente
        const { error } = await supabase
          .from('user_goals')
          .update({ goal_type: typedGoalType })
          .eq('id', userGoal.id);
          
        if (error) throw new Error(error.message);
        
        // Atualizar o estado local com o valor tipado
        setUserGoal({
          ...userGoal,
          goal_type: typedGoalType
        });
      } else {
        // Criar novo objetivo
        const { data, error } = await supabase
          .from('user_goals')
          .insert([{ user_id: user.id, goal_type: typedGoalType }])
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        
        if (data) {
          setUserGoal({
            ...data,
            goal_type: typedGoalType
          });
        }
      }
      
      toast({
        title: "Objetivo atualizado",
        description: "Seu objetivo foi salvo com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar objetivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar seu objetivo. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Gerar feedback com IA
  const generateFeedback = async () => {
    if (measurements.length < 1) return;
    setFeedbackLoading(true);
    
    try {
      const goalTypeLabel = userGoal 
        ? goalTypes.find(g => g.value === userGoal.goal_type)?.label || 'Não definido'
        : 'Não definido';
        
      const last5Measurements = measurements.slice(-5);
      
      // Criar prompt para a IA
      const prompt = `
        Analise os seguintes dados de medidas corporais para gerar um feedback personalizado:
        
        Objetivo do usuário: ${goalTypeLabel}
        
        Últimas medições (da mais antiga para a mais recente):
        ${last5Measurements.map(m => `
        Data: ${format(new Date(m.measured_at), 'dd/MM/yyyy')}
        Peso: ${m.weight || 'Não informado'} kg
        Altura: ${m.height || 'Não informado'} cm
        Cintura: ${m.waist || 'Não informado'} cm
        Quadril: ${m.hip || 'Não informado'} cm
        Braço: ${m.arm || 'Não informado'} cm
        Dobras cutâneas: ${m.skin_fold || 'Não informado'}
        `).join('\n')}
        
        Com base nesses dados, forneça um feedback personalizado de até 3 parágrafos que seja:
        1. Motivador e positivo
        2. Técnico mas acessível para leigos
        3. Adaptado ao objetivo selecionado (${goalTypeLabel})
        4. Com sugestões práticas para melhorar ou manter o progresso
      `;
      
      const { content, isError } = await openAIService.generateContent({
        prompt,
        max_tokens: 500,
        temperature: 0.7
      });
      
      if (isError || !content) {
        throw new Error("Erro ao gerar feedback");
      }
      
      setFeedback(content);
    } catch (error) {
      console.error("Erro ao gerar feedback:", error);
      setFeedback("Não foi possível gerar um feedback personalizado neste momento. Por favor, tente novamente mais tarde.");
    } finally {
      setFeedbackLoading(false);
    }
  };
  
  // Formatar dados para os gráficos
  const getChartData = () => {
    return measurements.map(m => ({
      date: format(new Date(m.measured_at), 'dd/MM'),
      peso: m.weight,
      cintura: m.waist,
      quadril: m.hip,
      braco: m.arm
    }));
  };
  
  // Configuração do gráfico
  const chartConfig = {
    peso: {
      color: "#8B5CF6",
      label: "Peso (kg)"
    },
    cintura: {
      color: "#F97316",
      label: "Cintura (cm)"
    },
    quadril: {
      color: "#0EA5E9",
      label: "Quadril (cm)"
    },
    braco: {
      color: "#10B981",
      label: "Braço (cm)"
    }
  };
  
  // Renderizar tabela de todas as medidas
  const renderMeasurementsTable = () => {
    if (measurements.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhuma medida registrada ainda.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left">Data</th>
              <th className="py-2 px-3 text-right">Peso</th>
              <th className="py-2 px-3 text-right">Altura</th>
              <th className="py-2 px-3 text-right">Cintura</th>
              <th className="py-2 px-3 text-right">Quadril</th>
              <th className="py-2 px-3 text-right">Braço</th>
            </tr>
          </thead>
          <tbody>
            {[...measurements].reverse().map(m => (
              <tr key={m.id} className="border-b hover:bg-muted/50">
                <td className="py-2 px-3">{format(new Date(m.measured_at), 'dd/MM/yyyy')}</td>
                <td className="py-2 px-3 text-right">{m.weight ? `${m.weight} kg` : '-'}</td>
                <td className="py-2 px-3 text-right">{m.height ? `${m.height} cm` : '-'}</td>
                <td className="py-2 px-3 text-right">{m.waist ? `${m.waist} cm` : '-'}</td>
                <td className="py-2 px-3 text-right">{m.hip ? `${m.hip} cm` : '-'}</td>
                <td className="py-2 px-3 text-right">{m.arm ? `${m.arm} cm` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Minha Evolução Corporal</h1>
        <p className="text-muted-foreground">Acompanhe suas medidas e veja seu progresso ao longo do tempo.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Card de Objetivo */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Seu Objetivo</CardTitle>
              <CardDescription>
                Defina seu objetivo para receber feedback personalizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Select
                  value={userGoal?.goal_type || ''}
                  onValueChange={(value) => saveGoal(value)}
                >
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Selecione seu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Objetivos</SelectLabel>
                      {goalTypes.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {userGoal 
                    ? `Objetivo definido: ${goalTypes.find(g => g.value === userGoal.goal_type)?.label}`
                    : "Nenhum objetivo definido ainda"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Botão para adicionar nova medida */}
          <div className="mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Registrar Nova Medida
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Registrar Medidas Corporais</DialogTitle>
                  <DialogDescription>
                    Preencha os campos abaixo com suas medidas atuais. Você não precisa preencher todos os campos.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="measured_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Medição</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <Input type="date" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="70.5" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="170" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="waist"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cintura (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="80" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quadril (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="100" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="arm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Braço (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="32" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="skin_fold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dobras Cutâneas (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Abdominal 25mm, Coxa 20mm" {...field} />
                          </FormControl>
                          <FormDescription>
                            Informe suas dobras cutâneas separadas por vírgula, se disponível.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas (opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Observações adicionais..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Salvar Medidas
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Gráficos e tabela */}
          {measurements.length > 0 ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Evolução das Medidas</CardTitle>
                <CardDescription>
                  Acompanhe suas medidas ao longo do tempo
                </CardDescription>
                
                <Tabs value={activeChart} onValueChange={setActiveChart}>
                  <TabsList className="grid grid-cols-4 sm:w-[400px]">
                    <TabsTrigger value="weight">Peso</TabsTrigger>
                    <TabsTrigger value="waist">Cintura</TabsTrigger>
                    <TabsTrigger value="hip">Quadril</TabsTrigger>
                    <TabsTrigger value="arm">Braço</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                <div className="h-[300px] mt-4">
                  <ChartContainer 
                    config={chartConfig}
                    className="h-[300px]"
                  >
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {activeChart === "weight" && (
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#8B5CF6" 
                          activeDot={{ r: 8 }}
                          name="Peso (kg)"
                        />
                      )}
                      {activeChart === "waist" && (
                        <Line 
                          type="monotone" 
                          dataKey="cintura" 
                          stroke="#F97316" 
                          activeDot={{ r: 8 }}
                          name="Cintura (cm)"
                        />
                      )}
                      {activeChart === "hip" && (
                        <Line 
                          type="monotone" 
                          dataKey="quadril" 
                          stroke="#0EA5E9" 
                          activeDot={{ r: 8 }}
                          name="Quadril (cm)"
                        />
                      )}
                      {activeChart === "arm" && (
                        <Line 
                          type="monotone" 
                          dataKey="braco" 
                          stroke="#10B981" 
                          activeDot={{ r: 8 }}
                          name="Braço (cm)"
                        />
                      )}
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          ) : null}
          
          {/* Feedback da IA */}
          {measurements.length > 0 && (
            <Card className="mb-8 bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Análise e Feedback</CardTitle>
                <CardDescription>
                  Análise personalizada com base no seu objetivo e progresso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : feedback ? (
                  <div className="prose prose-sm max-w-none">
                    {feedback.split('\n').map((paragraph, i) => (
                      paragraph.trim() ? <p key={i}>{paragraph}</p> : null
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button onClick={generateFeedback}>
                      Gerar Análise Personalizada
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Tabela com todas as medidas */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Medidas</CardTitle>
              <CardDescription>
                Registro completo de todas as suas medições
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMeasurementsTable()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EvolucaoCorporal;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Eye, EyeOff, User, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ESPECIALIDADES = [
  "Nutricionista",
  "Psicólogo(a)",
  "Terapeuta",
  "Personal Trainer",
  "Fisioterapeuta",
  "Médico(a)",
  "Coach de Saúde",
  "Outro",
];

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [accountType, setAccountType] = useState<"pessoa" | "profissional">("pessoa");
  const [specialty, setSpecialty] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.session) {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      setError(error.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!fullName || !phoneNumber || !email || !password) {
      setError("Todos os campos são obrigatórios");
      setLoading(false);
      return;
    }
    if (accountType === "profissional" && !specialty) {
      setError("Selecione sua especialidade");
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            account_type: accountType,
          }
        }
      });
      
      if (error) throw error;

      let activeSession = data.session;
      if (!activeSession) {
        const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        activeSession = signIn.session;
      }

      if (activeSession && accountType === "profissional") {
        const { error: proError } = await (supabase as any)
          .from("professional_profiles")
          .upsert({
            id: activeSession.user.id,
            display_name: fullName,
            specialty,
            registration_number: registrationNumber || null,
            whatsapp: phoneNumber,
            email_contact: email,
          }, { onConflict: "id" });
        if (proError) console.error("Erro ao criar perfil profissional:", proError);
      }

      if (activeSession) {
        toast.success("Cadastro realizado com sucesso!");
        navigate(accountType === "profissional" ? "/profissional" : "/");
      }
    } catch (error: any) {
      setError(error.message || "Erro ao criar conta. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success(
        "Se esse email estiver cadastrado, você receberá um link para redefinir sua senha."
      );
      setIsResetMode(false);
    } catch (error: any) {
      setError(error.message || "Erro ao enviar email de recuperação de senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
      {/* Green ambient glow */}
      <div className="pointer-events-none absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <ChefHat className="h-14 w-14 text-primary" strokeWidth={2.2} />
            <h1 className="text-4xl font-bold text-primary tracking-tight">MeuNutri.AI</h1>
          </div>
        </div>
        <p className="text-center mb-8 text-muted-foreground">
          {isResetMode
            ? "Digite seu email para receber o link de recuperação de senha"
            : "Faça login ou crie sua conta para acessar receitas personalizadas"}
        </p>

        <div className="bg-card border border-border/60 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Fazer Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setIsResetMode(true)}
                >
                  Esqueceu sua senha?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Tipo de conta</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType("pessoa")}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm transition ${accountType === "pessoa" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Pessoa Física</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("profissional")}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-sm transition ${accountType === "profissional" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <Briefcase className="h-5 w-5" />
                      <span className="font-medium">Profissional / Empresa</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-full-name">{accountType === "profissional" ? "Nome / Nome da empresa" : "Nome Completo"}</Label>
                  <Input
                    id="signup-full-name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Número de Celular</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showSignupPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;

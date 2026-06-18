import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ESPECIALISTAS, chatStorageKey, type EspecialistaId } from "@/lib/especialistas";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { openAIService } from "@/services/openai";
import { toast } from "@/components/ui/sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const buildUserContext = async (userId: string, profile: any) => {
  const lines: string[] = [];
  lines.push("=== PERFIL DO USUÁRIO ===");
  if (profile?.full_name) lines.push(`Nome: ${profile.full_name}`);
  if (profile?.gender) lines.push(`Sexo: ${profile.gender}`);
  if (profile?.age) lines.push(`Idade: ${profile.age}`);
  if (profile?.height_cm) lines.push(`Altura: ${profile.height_cm} cm`);
  if (profile?.weight_kg) lines.push(`Peso atual: ${profile.weight_kg} kg`);
  if (profile?.target_weight_kg) lines.push(`Peso meta: ${profile.target_weight_kg} kg`);
  if (profile?.goal) lines.push(`Objetivo: ${profile.goal}`);
  if (profile?.activity_level) lines.push(`Nível de atividade: ${profile.activity_level}`);
  if (profile?.dietary_restrictions) lines.push(`Restrições: ${profile.dietary_restrictions}`);
  if (profile?.health_conditions) lines.push(`Condições de saúde: ${profile.health_conditions}`);
  if (profile?.preferences) lines.push(`Preferências: ${profile.preferences}`);

  try {
    const [{ data: glucose }, { data: measures }, { data: meals }, { data: lib }] = await Promise.all([
      supabase.from("glucose_readings").select("value_mg_dl, reading_type, measured_at").eq("user_id", userId).order("measured_at", { ascending: false }).limit(5),
      supabase.from("body_measurements").select("weight_kg, body_fat_pct, measured_at").eq("user_id", userId).order("measured_at", { ascending: false }).limit(5),
      supabase.from("meal_logs").select("calories, protein_g, carbs_g, fat_g, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      supabase.from("library_items").select("title, content_type, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    ]);

    if (glucose?.length) {
      lines.push("\n=== GLICEMIA RECENTE ===");
      glucose.forEach((g: any) => lines.push(`- ${new Date(g.measured_at).toLocaleDateString("pt-BR")}: ${g.value_mg_dl} mg/dL (${g.reading_type})`));
    }
    if (measures?.length) {
      lines.push("\n=== EVOLUÇÃO CORPORAL ===");
      measures.forEach((m: any) => lines.push(`- ${new Date(m.measured_at).toLocaleDateString("pt-BR")}: ${m.weight_kg ?? "-"} kg${m.body_fat_pct ? `, ${m.body_fat_pct}% gordura` : ""}`));
    }
    if (meals?.length) {
      lines.push("\n=== ÚLTIMAS REFEIÇÕES ===");
      meals.forEach((m: any) => lines.push(`- ${new Date(m.created_at).toLocaleDateString("pt-BR")}: ${m.calories ?? "-"}kcal | P:${m.protein_g ?? "-"}g C:${m.carbs_g ?? "-"}g G:${m.fat_g ?? "-"}g`));
    }
    if (lib?.length) {
      lines.push("\n=== HISTÓRICO NA PLATAFORMA ===");
      lib.forEach((l: any) => lines.push(`- [${l.content_type}] ${l.title}`));
    }
  } catch (e) {
    console.error("ctx err", e);
  }
  return lines.join("\n");
};

const EspecialistaChat = () => {
  const { id } = useParams<{ id: EspecialistaId }>();
  const { user } = useAuth();
  const { profile } = useProfile();
  const especialista = id ? ESPECIALISTAS[id] : null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextStr, setContextStr] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(
    () => (user && id ? chatStorageKey(user.id, id) : null),
    [user, id]
  );

  useEffect(() => {
    if (!storageKey || !especialista) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setMessages(JSON.parse(saved)); return; } catch {}
    }
    setMessages([{
      role: "assistant",
      content: `Olá${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}! Sou o ${especialista.nome} ${especialista.emoji}. ${especialista.descricaoCurta} Como posso te ajudar hoje?`,
      ts: Date.now(),
    }]);
  }, [storageKey, especialista, profile]);

  useEffect(() => {
    if (storageKey && messages.length) localStorage.setItem(storageKey, JSON.stringify(messages));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, storageKey]);

  useEffect(() => {
    if (user) buildUserContext(user.id, profile).then(setContextStr);
  }, [user, profile]);

  if (!especialista) return <Navigate to="/especialistas" replace />;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const history = next
      .slice(-10)
      .map((m) => `${m.role === "user" ? "Usuário" : especialista.nome}: ${m.content}`)
      .join("\n\n");

    const prompt = `${especialista.systemPrompt}\n\n${contextStr}\n\n=== CONVERSA ===\n${history}\n\n${especialista.nome}:`;

    try {
      const res = await openAIService.generateContent({
        prompt,
        model: "gpt-4o",
        max_tokens: 1500,
        temperature: 0.75,
      });
      if (!res.isError && res.content) {
        setMessages((m) => [...m, { role: "assistant", content: res.content, ts: Date.now() }]);
      } else {
        toast.error("Não consegui responder agora. Tente de novo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    setMessages([{
      role: "assistant",
      content: `Conversa reiniciada. Como posso te ajudar?`,
      ts: Date.now(),
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] -mx-4">
      <div className={`px-4 py-3 border-b border-white/5 bg-gradient-to-r ${especialista.bgGradient}`}>
        <div className="flex items-center gap-3">
          <Link to="/especialistas">
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-11 w-11 rounded-2xl bg-background/60 border border-white/10 flex items-center justify-center text-2xl">
            {especialista.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">{especialista.nome}</div>
            <div className="text-[11px] text-emerald-400">● Online</div>
          </div>
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" onClick={clear} title="Limpar conversa">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef as any}>
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-background/60 border border-white/10 flex items-center justify-center text-base mr-2 shrink-0">
                  {especialista.emoji}
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/60 border border-white/5 rounded-bl-sm"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="h-8 w-8 rounded-xl bg-background/60 border border-white/10 flex items-center justify-center text-base mr-2">
                {especialista.emoji}
              </div>
              <div className="bg-muted/60 border border-white/5 rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="px-4 py-3 border-t border-white/5 bg-background/80 backdrop-blur">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Pergunte algo ao ${especialista.nome}...`}
            rows={1}
            disabled={loading}
            className="resize-none bg-muted/40 border-white/10 min-h-[42px] max-h-32"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EspecialistaChat;

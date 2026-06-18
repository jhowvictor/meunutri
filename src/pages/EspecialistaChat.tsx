import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Trash2, Paperclip, Image as ImageIcon, FileText, Mic, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ESPECIALISTAS, chatStorageKey, type EspecialistaId } from "@/lib/especialistas";
import { useAuth } from "@/components/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
  attachment?: { type: "image" | "file" | "audio"; name: string; preview?: string };
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      res(s.split(",")[1] || "");
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });

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
  if (profile?.health_conditions) lines.push(`Condições: ${profile.health_conditions}`);
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
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!input.trim() && !pendingImage && !pendingFile) || loading) return;

    const userText = input.trim();
    let attachment: ChatMessage["attachment"];
    if (pendingImage) attachment = { type: "image", name: pendingImage.file.name, preview: pendingImage.preview };
    else if (pendingFile) attachment = { type: "file", name: pendingFile.name };

    const userMsg: ChatMessage = {
      role: "user",
      content: userText || (pendingImage ? "[Imagem enviada]" : pendingFile ? `[Arquivo: ${pendingFile.name}]` : ""),
      ts: Date.now(),
      attachment,
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const history = next
        .slice(-10, -1)
        .filter((m) => !m.attachment)
        .map((m) => ({ role: m.role, content: m.content }));

      const payload: any = {
        systemMessage: `${especialista.systemPrompt}\n\n${contextStr}`,
        history,
        userText,
      };

      if (pendingImage) {
        payload.image = pendingImage.preview;
      }
      if (pendingFile) {
        payload.file = {
          name: pendingFile.name,
          mimetype: pendingFile.type || "application/octet-stream",
          base64: await fileToBase64(pendingFile),
        };
      }

      setPendingImage(null);
      setPendingFile(null);

      const { data, error } = await supabase.functions.invoke("especialista-chat", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((m) => [...m, { role: "assistant", content: data.content || "...", ts: Date.now() }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao responder.");
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) return toast.error("Imagem muito grande (máx 8MB).");
    const preview = await fileToDataUrl(f);
    setPendingImage({ file: f, preview });
    setPendingFile(null);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Arquivo muito grande (máx 10MB).");
    setPendingFile(f);
    setPendingImage(null);
  };

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) || "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        if (blob.size < 1024) {
          toast.error("Áudio muito curto. Tente de novo.");
          return;
        }
        setTranscribing(true);
        try {
          const ext = (rec.mimeType.includes("mp4") ? "mp4" : "webm");
          const fd = new FormData();
          fd.append("file", blob, `audio.${ext}`);
          const { data, error } = await supabase.functions.invoke("transcribe-audio", { body: fd });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          if (data?.text) {
            setInput((cur) => (cur ? `${cur} ${data.text}` : data.text));
            toast.success("Áudio transcrito!");
          }
        } catch (err: any) {
          toast.error(err?.message || "Erro ao transcrever.");
        } finally {
          setTranscribing(false);
        }
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error("Microfone indisponível. Verifique permissões.");
    }
  };

  const stopRecord = () => {
    recorderRef.current?.stop();
    setRecording(false);
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
                {m.attachment?.type === "image" && m.attachment.preview && (
                  <img src={m.attachment.preview} alt="" className="rounded-lg mb-2 max-h-48 w-auto" />
                )}
                {m.attachment?.type === "file" && (
                  <div className="flex items-center gap-1.5 text-xs opacity-90 mb-1">
                    <FileText className="h-3 w-3" /> {m.attachment.name}
                  </div>
                )}
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

      <div className="px-4 py-3 border-t border-white/5 bg-background/80 backdrop-blur space-y-2">
        {(pendingImage || pendingFile) && (
          <div className="flex items-center gap-2 bg-muted/40 border border-white/10 rounded-xl p-2">
            {pendingImage && (
              <img src={pendingImage.preview} alt="" className="h-12 w-12 rounded-lg object-cover" />
            )}
            {pendingFile && (
              <div className="h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-xs truncate">
              {pendingImage?.file.name || pendingFile?.name}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => { setPendingImage(null); setPendingFile(null); }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {(recording || transcribing) && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-rose-300">
            {recording ? (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                Gravando áudio... toque no botão para parar
              </>
            ) : (
              <>Transcrevendo áudio...</>
            )}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full shrink-0" disabled={loading || recording}>
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                <ImageIcon className="h-4 w-4 mr-2" /> Enviar foto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-4 w-4 mr-2" /> Enviar documento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={onPickImage} />
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.doc,.docx" hidden onChange={onPickFile} />

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
            disabled={loading || recording}
            className="resize-none bg-muted/40 border-white/10 min-h-[42px] max-h-32"
          />

          {input.trim() || pendingImage || pendingFile ? (
            <Button size="icon" onClick={send} disabled={loading} className="rounded-full shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          ) : recording ? (
            <Button size="icon" onClick={stopRecord} className="rounded-full shrink-0 bg-rose-500 hover:bg-rose-600">
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button size="icon" onClick={startRecord} disabled={loading || transcribing} className="rounded-full shrink-0" variant="secondary">
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EspecialistaChat;

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Circle, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ESPECIALISTAS_LIST, type Especialista } from "@/lib/especialistas";

const EspecialistasIA = () => {
  const [selected, setSelected] = useState<Especialista | null>(null);

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s]">
      <div className="flex items-center gap-2 pt-2">
        <Link to="/">
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-sm font-medium text-muted-foreground">Voltar</span>
      </div>

      <section className="relative overflow-hidden rounded-3xl glass border border-white/10 px-5 py-6">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-3">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-medium text-primary">Equipe disponível 24h</span>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight">
            Especialistas <span className="text-primary">IA</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sua equipe completa de especialistas. Escolha com quem você quer conversar.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        {ESPECIALISTAS_LIST.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="w-full text-left"
          >
            <div className={`relative glass rounded-2xl p-4 border border-white/10 card-hover overflow-hidden bg-gradient-to-br ${e.bgGradient}`}>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 rounded-2xl bg-background/60 border border-white/10 flex items-center justify-center text-3xl">
                    {e.emoji}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5 bg-emerald-500 rounded-full px-1.5 py-0.5 border-2 border-background">
                    <Circle className="h-1.5 w-1.5 fill-white text-white" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base">{e.nome}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">● Online</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">
                    {e.descricaoCurta}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
              </div>
            </div>
          </button>
        ))}
      </section>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${selected.bgGradient} border border-white/10 flex items-center justify-center text-3xl`}>
                    {selected.emoji}
                  </div>
                  <div>
                    <DialogTitle className="text-left">{selected.nome}</DialogTitle>
                    <p className="text-xs text-muted-foreground text-left mt-0.5">{selected.tagline}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <h4 className="font-semibold text-sm mb-2">O que eu faço</h4>
                  <ul className="space-y-1.5">
                    {selected.oQueFaz.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Você pode me pedir</h4>
                  <div className="space-y-1.5">
                    {selected.exemplos.map((ex) => (
                      <div key={ex} className="text-xs bg-muted/40 border border-white/5 rounded-lg px-3 py-2 italic">
                        "{ex}"
                      </div>
                    ))}
                  </div>
                </div>

                <Link to={`/especialistas/${selected.id}`}>
                  <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-sm font-semibold">
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Conversar com {selected.nome}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EspecialistasIA;

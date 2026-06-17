import { Link } from "react-router-dom";
import { ChefHat, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile, useAvatarUrl } from "@/hooks/useProfile";

const PremiumHeader = () => {
  const { profile } = useProfile();
  const avatarUrl = useAvatarUrl(profile?.avatar_url);
  const initial = (profile?.full_name || "U").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-white/5">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-1.5 neon-glow-sm">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            MeuNutri<span className="text-primary">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            className="relative h-10 w-10 rounded-full glass border border-white/10 flex items-center justify-center hover:border-primary/40 transition"
            aria-label="Notificações"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              2
            </span>
          </button>
          <Link to="/perfil">
            <Avatar className="h-10 w-10 border-2 border-primary/60 neon-glow-sm">
              <AvatarImage src={avatarUrl ?? undefined} alt="Avatar" />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PremiumHeader;

import { Home, Library, Heart, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/minha-biblioteca", label: "Biblioteca", icon: Library },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/perfil", label: "Perfil", icon: User },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="glass-strong rounded-2xl border border-white/10 px-2 py-2 shadow-2xl">
          <ul className="grid grid-cols-4">
            {items.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform",
                        active && "drop-shadow-[0_0_10px_hsl(var(--primary)/0.8)]"
                      )}
                    />
                    <span className="text-[10px] font-medium">{label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

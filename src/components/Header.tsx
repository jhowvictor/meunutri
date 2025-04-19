
import { Link } from "react-router-dom";
import { ChefHat, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { toast } from "@/components/ui/sonner";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/hooks/use-language";

const Header = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("logout_success"));
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm py-4 sticky top-0 z-50 border-b border-primary/10">
      <div className="container max-w-5xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-gradient font-bold">
          <div className="rounded-full bg-gradient-to-br from-primary to-accent p-2 shadow-md">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl hidden sm:block">MeuNutri.AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground bg-white/80 backdrop-blur-md py-1 px-3 rounded-full shadow-sm">
                <User className="h-4 w-4 mr-2 text-primary" />
                <span className="hidden sm:block">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full">
                <LogOut className="h-4 w-4 mr-2 text-primary" />
                <span className="hidden sm:block">{t("logout")}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

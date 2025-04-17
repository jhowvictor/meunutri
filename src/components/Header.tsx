
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
    <header className="bg-white shadow-sm py-4">
      <div className="container max-w-5xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <ChefHat className="h-8 w-8" />
          <span className="font-bold text-xl hidden sm:block">MeuNutri.AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:block">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
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

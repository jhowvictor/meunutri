
import { Link } from "react-router-dom";
import { ChefHat, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { toast } from "@/components/ui/sonner";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sessão encerrada com sucesso!");
  };

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container max-w-5xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <ChefHat className="h-8 w-8" />
          <span className="font-bold text-xl hidden sm:block">Chef Saudável Digital</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">{user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

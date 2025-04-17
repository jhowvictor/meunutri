
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface Language {
  code: string;
  name: string;
  flag: string;
  label: string;
}

const languages: Language[] = [
  { code: "pt", name: "Português", flag: "🇧🇷", label: "Português" },
  { code: "en", name: "English", flag: "🇺🇸", label: "Inglês" },
  { code: "es", name: "Español", flag: "🇪🇸", label: "Espanhol" },
  { code: "fr", name: "Français", flag: "🇫🇷", label: "Francês" },
  { code: "it", name: "Italiano", flag: "🇮🇹", label: "Italiano" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", label: "Alemão" }
];

const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Salva a preferência de idioma no perfil do usuário
  const saveLanguagePreference = async (langCode: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: langCode })
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar preferência de idioma:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    setLanguage(langCode);
    if (user) {
      await saveLanguagePreference(langCode);
    }
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 w-auto" 
          disabled={isLoading}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer flex items-center gap-2"
          >
            <span>{language.flag}</span>
            <span>{language.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;

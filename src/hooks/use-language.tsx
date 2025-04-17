
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

type LanguageContextType = {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  formatUnit: (value: number, unit: string, format?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState("pt"); // Português como padrão
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const { user } = useAuth();

  // Carrega as traduções
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Em um caso real, carregaríamos de arquivos JSON ou de uma API
        const translationsData = {
          pt: {
            "welcome": "Bem-vindo ao Chef Saudável Digital",
            "recipe_title": "Receita Personalizada",
            "diet_title": "Dieta Personalizada",
            "ebook_title": "E-book Personalizado",
            "shopping_list": "Lista de Compras",
            // ... mais traduções
          },
          en: {
            "welcome": "Welcome to Digital Healthy Chef",
            "recipe_title": "Custom Recipe",
            "diet_title": "Custom Diet",
            "ebook_title": "Custom E-book",
            "shopping_list": "Shopping List",
            // ... mais traduções
          },
          es: {
            "welcome": "Bienvenido a Chef Saludable Digital",
            "recipe_title": "Receta Personalizada",
            "diet_title": "Dieta Personalizada",
            "ebook_title": "E-book Personalizado",
            "shopping_list": "Lista de Compras",
            // ... mais traduções
          },
          fr: {
            "welcome": "Bienvenue au Chef Santé Numérique",
            "recipe_title": "Recette Personnalisée",
            "diet_title": "Régime Personnalisé",
            "ebook_title": "E-book Personnalisé",
            "shopping_list": "Liste d'Achats",
            // ... mais traduções
          },
          it: {
            "welcome": "Benvenuto a Chef Salutare Digitale",
            "recipe_title": "Ricetta Personalizzata",
            "diet_title": "Dieta Personalizzata",
            "ebook_title": "E-book Personalizzato",
            "shopping_list": "Lista della Spesa",
            // ... mais traduções
          },
          de: {
            "welcome": "Willkommen beim Digitalen Gesundheitskoch",
            "recipe_title": "Personalisiertes Rezept",
            "diet_title": "Personalisierte Diät",
            "ebook_title": "Personalisiertes E-Book",
            "shopping_list": "Einkaufsliste",
            // ... mais traduções
          }
        };
        
        setTranslations(translationsData);
      } catch (error) {
        console.error("Erro ao carregar traduções:", error);
      }
    };
    
    loadTranslations();
  }, []);

  // Carrega a preferência de idioma do usuário
  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.language_preference) {
          setCurrentLanguage(data.language_preference);
        }
      } catch (error) {
        console.error("Erro ao carregar preferência de idioma:", error);
      }
    };
    
    loadUserLanguagePreference();
  }, [user]);

  // Função para traduzir uma string
  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[currentLanguage]?.[key] || key;
    
    if (!params) return translation;
    
    // Substitui parâmetros na string traduzida
    return Object.entries(params).reduce(
      (str, [param, value]) => str.replace(`{{${param}}}`, value),
      translation
    );
  };

  // Sistema de conversão de unidades
  const unitConversions: Record<string, Record<string, (value: number) => number>> = {
    // Conversões de peso
    "kg": {
      "pt": (value) => value,
      "en": (value) => value * 2.20462, // kg para libras
      "es": (value) => value,
      "fr": (value) => value,
      "it": (value) => value,
      "de": (value) => value,
    },
    "g": {
      "pt": (value) => value,
      "en": (value) => value * 0.035274, // g para onças
      "es": (value) => value,
      "fr": (value) => value,
      "it": (value) => value,
      "de": (value) => value,
    },
    // Conversões de comprimento
    "cm": {
      "pt": (value) => value,
      "en": (value) => value * 0.393701, // cm para polegadas
      "es": (value) => value,
      "fr": (value) => value,
      "it": (value) => value,
      "de": (value) => value,
    },
    // Conversões de volume
    "ml": {
      "pt": (value) => value,
      "en": (value) => value * 0.033814, // ml para onça fluida
      "es": (value) => value,
      "fr": (value) => value,
      "it": (value) => value,
      "de": (value) => value,
    },
    // ... outras conversões
  };

  const unitLabels: Record<string, Record<string, string>> = {
    "kg": {
      "pt": "kg",
      "en": "lb",
      "es": "kg",
      "fr": "kg",
      "it": "kg",
      "de": "kg",
    },
    "g": {
      "pt": "g",
      "en": "oz",
      "es": "g",
      "fr": "g",
      "it": "g",
      "de": "g",
    },
    "cm": {
      "pt": "cm",
      "en": "in",
      "es": "cm",
      "fr": "cm",
      "it": "cm",
      "de": "cm",
    },
    "ml": {
      "pt": "ml",
      "en": "fl oz",
      "es": "ml",
      "fr": "ml",
      "it": "ml",
      "de": "ml",
    },
    // ... outros rótulos
  };

  const formatUnit = (value: number, unit: string, format: string = "0.##"): string => {
    // Converte o valor para a unidade do idioma atual
    const convertedValue = unitConversions[unit]?.[currentLanguage] 
      ? unitConversions[unit][currentLanguage](value)
      : value;
    
    // Obtém o rótulo da unidade no idioma atual
    const unitLabel = unitLabels[unit]?.[currentLanguage] || unit;
    
    // Formata o número
    const formattedValue = new Intl.NumberFormat(currentLanguage, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(convertedValue);
    
    return `${formattedValue} ${unitLabel}`;
  };

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    // Opcionalmente, podemos salvar a preferência em localStorage também
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, formatUnit }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider");
  }
  return context;
};

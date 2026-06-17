import { useState } from "react";
import { Heart, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

export type LibraryContentType =
  | "receita"
  | "dieta"
  | "treino"
  | "ebook"
  | "lista_compras"
  | "analise_refeicao"
  | "evolucao"
  | "mini_chef";

interface SaveToLibraryProps {
  contentType: LibraryContentType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  className?: string;
}

const SaveToLibrary = ({
  contentType,
  title,
  content,
  metadata = {},
  className = "",
}: SaveToLibraryProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleSave = async (favorite = false) => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar.");
      return;
    }
    if (!content?.trim()) {
      toast.error("Nada para salvar ainda.");
      return;
    }

    setSaving(true);
    try {
      if (savedId) {
        const { error } = await supabase
          .from("library_items")
          .update({ is_favorite: favorite })
          .eq("id", savedId);
        if (error) throw error;
        setIsFavorite(favorite);
        toast.success(favorite ? "Adicionado aos favoritos!" : "Removido dos favoritos.");
      } else {
        const { data, error } = await supabase
          .from("library_items")
          .insert({
            user_id: user.id,
            content_type: contentType,
            title: title || "Sem título",
            content,
            metadata: metadata as never,
            is_favorite: favorite,
          })
          .select("id")
          .single();
        if (error) throw error;
        setSavedId(data.id);
        setIsFavorite(favorite);
        toast.success("Conteúdo salvo com sucesso na sua Biblioteca.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleSave(isFavorite)}
        disabled={saving}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        <span className="ml-1">{savedId ? "Salvo" : "Salvar na Biblioteca"}</span>
      </Button>
      <Button
        type="button"
        variant={isFavorite ? "default" : "outline"}
        size="sm"
        onClick={() => handleSave(!isFavorite)}
        disabled={saving}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        <span className="ml-1">{isFavorite ? "Favoritado" : "Favoritar"}</span>
      </Button>
    </div>
  );
};

export default SaveToLibrary;

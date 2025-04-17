
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Folder, FolderPlus, Search, Edit, Trash, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ui/sonner";

interface Folder {
  id: string;
  name: string;
  created_at: string;
  recipe_count?: number;
}

const MinhasPastas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [filteredFolders, setFilteredFolders] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Buscar pastas
  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  // Filtrar pastas com base na busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredFolders(folders);
      return;
    }

    const filtered = folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredFolders(filtered);
  }, [searchTerm, folders]);

  // Buscar pastas do usuário junto com a contagem de receitas
  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      
      // Primeiro, buscar todas as pastas do usuário
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('id, name, created_at')
        .eq('user_id', user?.id)
        .order('name');
        
      if (foldersError) throw foldersError;
      
      if (!foldersData || foldersData.length === 0) {
        setFolders([]);
        setFilteredFolders([]);
        setIsLoading(false);
        return;
      }
      
      // Para cada pasta, contar o número de receitas
      const foldersWithCounts = await Promise.all(
        foldersData.map(async (folder) => {
          const { count, error: countError } = await supabase
            .from('folder_recipes')
            .select('recipe_id', { count: 'exact', head: true })
            .eq('folder_id', folder.id);
            
          if (countError) {
            console.error(`Erro ao contar receitas para pasta ${folder.id}:`, countError);
            return { ...folder, recipe_count: 0 };
          }
          
          return { ...folder, recipe_count: count || 0 };
        })
      );
      
      setFolders(foldersWithCounts);
      setFilteredFolders(foldersWithCounts);
    } catch (error) {
      console.error("Erro ao buscar pastas:", error);
      toast.error("Não foi possível carregar suas pastas de receitas");
    } finally {
      setIsLoading(false);
    }
  };

  // Manipuladores para criação de pasta
  const handleAddFolder = () => {
    setFolderName("");
    setShowAddDialog(true);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase
        .from('folders')
        .insert({
          user_id: user?.id,
          name: folderName.trim()
        })
        .select()
        .single();
        
      if (error) {
        // Verificar se é um erro de duplicação (nome de pasta já existe)
        if (error.code === '23505') {
          toast.error("Você já tem uma pasta com este nome");
        } else {
          throw error;
        }
      } else if (data) {
        setFolders(prev => [...prev, { ...data, recipe_count: 0 }]);
        toast.success("Pasta criada com sucesso");
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
      toast.error("Não foi possível criar a pasta");
    } finally {
      setIsProcessing(false);
    }
  };

  // Manipuladores para edição de pasta
  const handleEditFolder = (folder: Folder) => {
    setCurrentFolder(folder);
    setFolderName(folder.name);
    setShowEditDialog(true);
  };

  const handleUpdateFolder = async () => {
    if (!folderName.trim() || !currentFolder) return;
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('folders')
        .update({ name: folderName.trim() })
        .eq('id', currentFolder.id);
        
      if (error) {
        // Verificar se é um erro de duplicação (nome de pasta já existe)
        if (error.code === '23505') {
          toast.error("Você já tem uma pasta com este nome");
        } else {
          throw error;
        }
      } else {
        setFolders(prev => 
          prev.map(f => 
            f.id === currentFolder.id 
              ? { ...f, name: folderName.trim() } 
              : f
          )
        );
        toast.success("Nome da pasta atualizado");
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar pasta:", error);
      toast.error("Não foi possível atualizar o nome da pasta");
    } finally {
      setIsProcessing(false);
    }
  };

  // Manipuladores para exclusão de pasta
  const handleDeletePrompt = (folder: Folder) => {
    setCurrentFolder(folder);
    setShowDeleteDialog(true);
  };

  const handleDeleteFolder = async () => {
    if (!currentFolder) return;
    
    try {
      setIsProcessing(true);
      
      // A pasta será excluída e todas as associações folder_recipes devido à restrição ON DELETE CASCADE
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', currentFolder.id);
        
      if (error) throw error;
      
      setFolders(prev => prev.filter(f => f.id !== currentFolder.id));
      toast.success("Pasta excluída com sucesso");
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Erro ao excluir pasta:", error);
      toast.error("Não foi possível excluir a pasta");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30 py-8">
      <div className="container max-w-4xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <Folder className="h-6 w-6 mr-2 text-primary" />
              Minhas Pastas
            </h1>
          </div>
          <Button onClick={handleAddFolder} className="flex items-center">
            <FolderPlus className="h-5 w-5 mr-2" />
            Nova Pasta
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pastas..."
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredFolders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFolders.map((folder) => (
              <Card key={folder.id} className="overflow-hidden">
                <CardHeader className="p-4 flex flex-row justify-between items-start space-y-0">
                  <div>
                    <CardTitle className="text-lg mb-1">
                      {folder.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {folder.recipe_count} {folder.recipe_count === 1 ? 'receita' : 'receitas'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/pasta/${folder.id}`)}>
                        Ver receitas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                        <Edit className="h-4 w-4 mr-2" /> Editar nome
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeletePrompt(folder)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash className="h-4 w-4 mr-2" /> Excluir pasta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full h-16 rounded-none flex items-center justify-center hover:bg-primary/10"
                    onClick={() => navigate(`/pasta/${folder.id}`)}
                  >
                    <Folder className="h-6 w-6 mr-2" />
                    Abrir pasta
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-4">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma pasta encontrada</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm 
                ? "Tente uma busca diferente" 
                : "Crie pastas para organizar suas receitas favoritas"}
            </p>
            <Button className="mt-4" onClick={handleAddFolder}>
              <FolderPlus className="h-5 w-5 mr-2" />
              Criar primeira pasta
            </Button>
          </div>
        )}
      </div>

      {/* Diálogo para adicionar pasta */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nome da pasta</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Ex: Receitas para o café da manhã"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isProcessing}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleCreateFolder}
              disabled={!folderName.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar pasta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar pasta */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Nome da Pasta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Novo nome</Label>
              <Input
                id="edit-folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Nome da pasta"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isProcessing}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleUpdateFolder}
              disabled={!folderName.trim() || folderName === currentFolder?.name || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão de pasta */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A pasta "{currentFolder?.name}" será excluída permanentemente, 
              junto com todas as referências a receitas dentro dela.
              <br /><br />
              As receitas em si não serão excluídas, apenas removidas desta pasta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir pasta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MinhasPastas;

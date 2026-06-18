import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Plus, Trash2, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { openAIService } from "@/services/openai";
import jsPDF from "jspdf";

interface List { id: string; title: string; created_at: string; estimated_total: number | null }
interface Item { id: string; list_id: string; name: string; category: string | null; quantity: string | null; estimated_price: number | null; is_purchased: boolean }

const CATEGORIES = ["Frutas", "Vegetais", "Proteínas", "Laticínios", "Grãos", "Padaria", "Bebidas", "Higiene", "Outros"];

const ListaCompras = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [activeList, setActiveList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [genOpen, setGenOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Outros", quantity: "", estimated_price: "" });

  const loadLists = async () => {
    if (!user) return;
    const { data } = await (supabase as any).from("shopping_lists").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setLists((data as List[]) || []);
  };
  const loadItems = async (listId: string) => {
    const { data } = await (supabase as any).from("shopping_items").select("*").eq("list_id", listId).order("category").order("position");
    setItems((data as Item[]) || []);
  };
  useEffect(() => { loadLists(); /* eslint-disable-next-line */ }, [user]);
  useEffect(() => { if (activeList) loadItems(activeList.id); }, [activeList]);

  const generateAI = async () => {
    if (!user) return;
    if (!prompt.trim()) return toast.error("Descreva o que você precisa.");
    if (!openAIService.getApiKey()) return toast.error("Configure sua chave OpenAI primeiro.");
    setLoading(true);
    try {
      const aiPrompt = `Crie uma lista de compras estruturada baseada em: "${prompt}". Responda APENAS em JSON válido com este formato:
{"title":"...","items":[{"name":"...","category":"Frutas|Vegetais|Proteínas|Laticínios|Grãos|Padaria|Bebidas|Higiene|Outros","quantity":"2 kg","estimated_price":15.00}]}`;
      const result = await openAIService.generateContent({ prompt: aiPrompt, max_tokens: 1500 });
      if (result.isError) throw new Error(result.content);
      const match = result.content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Resposta inválida");
      const parsed = JSON.parse(match[0]);
      const total = parsed.items.reduce((s: number, i: any) => s + (Number(i.estimated_price) || 0), 0);
      const { data: list, error } = await (supabase as any).from("shopping_lists").insert({ user_id: user.id, title: parsed.title || "Lista", estimated_total: total }).select().single();
      if (error) throw error;
      const itemsPayload = parsed.items.map((i: any, idx: number) => ({ list_id: list.id, name: i.name, category: i.category || "Outros", quantity: i.quantity || null, estimated_price: i.estimated_price || null, position: idx }));
      await (supabase as any).from("shopping_items").insert(itemsPayload);
      setGenOpen(false); setPrompt("");
      await loadLists();
      setActiveList(list);
      toast.success("Lista criada!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar lista");
    } finally { setLoading(false); }
  };

  const createBlank = async () => {
    if (!user) return;
    const { data } = await (supabase as any).from("shopping_lists").insert({ user_id: user.id, title: "Nova lista" }).select().single();
    await loadLists();
    setActiveList(data);
  };

  const addItem = async () => {
    if (!activeList || !newItem.name) return;
    await (supabase as any).from("shopping_items").insert({
      list_id: activeList.id, name: newItem.name, category: newItem.category,
      quantity: newItem.quantity || null, estimated_price: newItem.estimated_price ? parseFloat(newItem.estimated_price) : null,
      position: items.length,
    });
    setNewItem({ name: "", category: "Outros", quantity: "", estimated_price: "" });
    loadItems(activeList.id);
  };

  const togglePurchased = async (i: Item) => {
    await (supabase as any).from("shopping_items").update({ is_purchased: !i.is_purchased }).eq("id", i.id);
    setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, is_purchased: !x.is_purchased } : x)));
  };

  const removeItem = async (id: string) => {
    await (supabase as any).from("shopping_items").delete().eq("id", id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const removeList = async (id: string) => {
    await (supabase as any).from("shopping_lists").delete().eq("id", id);
    if (activeList?.id === id) setActiveList(null);
    loadLists();
  };

  const exportPdf = () => {
    if (!activeList) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(activeList.title, 14, 20);
    let y = 32;
    const grouped = items.reduce<Record<string, Item[]>>((acc, i) => { (acc[i.category || "Outros"] = acc[i.category || "Outros"] || []).push(i); return acc; }, {});
    Object.entries(grouped).forEach(([cat, arr]) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(cat, 14, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      arr.forEach((i) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`☐ ${i.name}${i.quantity ? ` — ${i.quantity}` : ""}${i.estimated_price ? ` (R$ ${i.estimated_price.toFixed(2)})` : ""}`, 18, y);
        y += 6;
      });
      y += 4;
    });
    const total = items.reduce((s, i) => s + Number(i.estimated_price || 0), 0);
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.text(`Total estimado: R$ ${total.toFixed(2)}`, 14, y + 5);
    doc.save(`${activeList.title}.pdf`);
  };

  const grouped = items.reduce<Record<string, Item[]>>((acc, i) => { (acc[i.category || "Outros"] = acc[i.category || "Outros"] || []).push(i); return acc; }, {});
  const total = items.reduce((s, i) => s + Number(i.estimated_price || 0), 0);
  const purchasedTotal = items.filter((i) => i.is_purchased).reduce((s, i) => s + Number(i.estimated_price || 0), 0);
  const progress = items.length > 0 ? Math.round((items.filter((i) => i.is_purchased).length / items.length) * 100) : 0;

  if (!activeList) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/"><Button variant="ghost" size="icon" className="mr-2"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="text-2xl font-bold flex items-center"><ShoppingCart className="h-6 w-6 mr-2 text-primary" />Listas de Compras</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setGenOpen(true)} className="flex-1"><Sparkles className="h-4 w-4 mr-2" />Gerar com IA</Button>
          <Button variant="outline" onClick={createBlank}><Plus className="h-4 w-4 mr-2" />Em branco</Button>
        </div>
        <div className="space-y-2">
          {lists.map((l) => (
            <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <button className="flex-1 text-left" onClick={() => setActiveList(l)}>
                <div className="font-semibold">{l.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")} {l.estimated_total ? `• R$ ${Number(l.estimated_total).toFixed(2)}` : ""}</div>
              </button>
              <button onClick={() => removeList(l.id)} className="text-muted-foreground hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {lists.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">Nenhuma lista. Crie uma!</div>}
        </div>

        <Dialog open={genOpen} onOpenChange={setGenOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Gerar lista com IA</DialogTitle></DialogHeader>
            <Textarea placeholder="Ex: ingredientes para almoço low-carb da semana, 4 pessoas" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenOpen(false)}>Cancelar</Button>
              <Button onClick={generateAI} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => setActiveList(null)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-xl font-bold flex-1 truncate">{activeList.title}</h1>
        <Button size="sm" variant="outline" onClick={exportPdf}><FileText className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label="Itens" value={`${items.length}`} />
        <Stat label="Comprados" value={`${progress}%`} />
        <Stat label="Total" value={`R$ ${total.toFixed(2)}`} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3 mb-4">
        <div className="text-xs font-bold mb-2">Adicionar item</div>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Nome" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
          <select className="rounded-md border border-input bg-background px-3 text-sm" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Input placeholder="Qtd (ex: 2 kg)" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
          <Input type="number" step="0.01" placeholder="Preço R$" value={newItem.estimated_price} onChange={(e) => setNewItem({ ...newItem, estimated_price: e.target.value })} />
        </div>
        <Button size="sm" className="w-full mt-2" onClick={addItem}><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
      </div>

      {Object.entries(grouped).map(([cat, arr]) => (
        <div key={cat} className="mb-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">{cat}</h3>
          <div className="space-y-1">
            {arr.map((i) => (
              <div key={i.id} className={`flex items-center gap-2 p-2 rounded-lg border border-white/10 ${i.is_purchased ? "opacity-50 line-through" : ""}`}>
                <Checkbox checked={i.is_purchased} onCheckedChange={() => togglePurchased(i)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.name}</div>
                  <div className="text-[10px] text-muted-foreground">{i.quantity || ""} {i.estimated_price ? `• R$ ${Number(i.estimated_price).toFixed(2)}` : ""}</div>
                </div>
                <button onClick={() => removeItem(i.id)} className="text-muted-foreground hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="text-center text-muted-foreground text-sm py-6">Lista vazia. Adicione itens acima.</div>}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
    <div className="text-base font-extrabold">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
  </div>
);

export default ListaCompras;

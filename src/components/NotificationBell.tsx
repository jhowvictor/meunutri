import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const typeColor: Record<string, string> = {
  info: "bg-primary/15 text-primary",
  warning: "bg-amber-500/15 text-amber-500",
  success: "bg-emerald-500/15 text-emerald-500",
  alert: "bg-rose-500/15 text-rose-500",
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as Notification[]) || []);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const unread = items.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    await (supabase as any).from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const remove = async (id: string) => {
    await (supabase as any).from("notifications").delete().eq("id", id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) markAllRead(); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full relative h-9 w-9">
          <Bell className="h-4 w-4 text-primary" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b font-bold text-sm">Notificações</div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Nenhuma notificação</div>
          ) : (
            items.map((n) => (
              <div key={n.id} className="p-3 border-b last:border-b-0 flex gap-2 items-start">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeColor[n.type] || typeColor.info}`}>{n.type}</span>
                <div className="flex-1 min-w-0">
                  {n.link ? (
                    <Link to={n.link} onClick={() => setOpen(false)} className="block">
                      <div className="text-sm font-semibold">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                    </Link>
                  ) : (
                    <>
                      <div className="text-sm font-semibold">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                    </>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;

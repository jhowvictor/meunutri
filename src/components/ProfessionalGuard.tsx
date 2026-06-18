import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  children: ReactNode;
}

const ProfessionalGuard = ({ children }: Props) => {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!user) return;
    (supabase as any)
      .from("professional_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: any) => {
        setIsPro(!!data);
        setChecked(true);
      });
  }, [user]);

  if (!checked) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">Verificando acesso...</div>
    );
  }
  if (!isPro) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default ProfessionalGuard;

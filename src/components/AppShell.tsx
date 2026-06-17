import { ReactNode } from "react";
import PremiumHeader from "./PremiumHeader";
import BottomNav from "./BottomNav";
import MiniChef from "./MiniChef";

interface AppShellProps {
  children: ReactNode;
  hideHeader?: boolean;
}

const AppShell = ({ children, hideHeader = false }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideHeader && <PremiumHeader />}
      <main className="mx-auto max-w-md px-4 pb-32 pt-2">{children}</main>
      <MiniChef />
      <BottomNav />
    </div>
  );
};

export default AppShell;

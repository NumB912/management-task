import React from "react";
import Side from "../component/side.component";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HeaderProvider } from "../providers/header.provider";
import { AuthProvider } from "../providers/auth.provider";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider className="overflow-hidden">
      <AuthProvider>
        <Side />
        <HeaderProvider>
          <main className="flex-1 min-w-0">{children}</main>
        </HeaderProvider>
      </AuthProvider>
    </SidebarProvider>
  );
};

export default layout;

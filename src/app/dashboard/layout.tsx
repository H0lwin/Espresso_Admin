
"use client";

import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";

// This new component will be a child of SidebarProvider and can safely use useSidebar.
function CustomSidebarHeaderContent() {
  const { state } = useSidebar();
  return (
    <div className={cn(
      "flex items-center justify-between",
      state === "collapsed" && "justify-center"
    )}>
      <div className={cn(state === "collapsed" && "hidden")}>
        <Logo size="md" />
      </div>
      <SidebarCollapseButton />
    </div>
  );
}

function SidebarCollapseButton() {
  const { toggleSidebar, state, isMobile } = useSidebar();
  if (isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      aria-label={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(state === "collapsed" && "rotate-180")}
    >
      <PanelLeftClose className="h-5 w-5" />
    </Button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [defaultOpen, setDefaultOpen] = React.useState(true);

   React.useEffect(() => {
    const checkIsMobile = () => window.innerWidth < 768;
    if (checkIsMobile()) {
      setDefaultOpen(false);
    }
  }, []);


  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar
        variant="sidebar" 
        collapsible="icon" 
        side="left"
      >
        <SidebarHeader className="p-4">
          {/* Use the new component here */}
          <CustomSidebarHeaderContent />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-4">
          {/* Optional: Footer content like a mini-profile or logout button */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

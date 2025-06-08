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
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize with sidebar open on desktop, closed on mobile by default
  // The SidebarProvider itself handles cookie persistence for desktop state
  const [defaultOpen, setDefaultOpen] = React.useState(true);

   React.useEffect(() => {
    const checkIsMobile = () => window.innerWidth < 768;
    if (checkIsMobile()) {
      setDefaultOpen(false);
    }
    // This effect should ideally run once on mount.
    // If you need to react to resize, add a resize listener.
  }, []);


  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar
        variant="sidebar" // "sidebar", "floating", "inset"
        collapsible="icon" // "offcanvas", "icon", "none"
        side="left"
      >
        <SidebarHeader className="p-4">
          <div className={cn(
            "flex items-center justify-between",
            useSidebar().state === "collapsed" && "justify-center"
          )}>
            <div className={cn(useSidebar().state === "collapsed" && "hidden")}>
              <Logo size="md" />
            </div>
            <SidebarCollapseButton />
          </div>
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

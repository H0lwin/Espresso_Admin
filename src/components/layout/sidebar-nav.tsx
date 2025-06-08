
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ListOrdered,
  ShoppingBag,
  Users,
  FileText,
  LayoutPanelLeft,
  Contact,
  ShieldCheck,
  FileLock2,
  PercentSquare,
  Mail,
  Settings2,
  UserCog,
  UserCircle2,
  ChevronDown,
  ChevronRight,
  Home,
  Info,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Menu", href: "/dashboard/menu", icon: ListOrdered },
  { title: "Merchandise", href: "/dashboard/merchandise", icon: ShoppingBag },
  { title: "Customers", href: "/dashboard/customers", icon: Users },
  {
    title: "CMS",
    href: "/dashboard/cms",
    icon: LayoutPanelLeft,
    items: [
      { title: "Home Page", href: "/dashboard/cms/home", icon: Home },
      { title: "About Page", href: "/dashboard/cms/about", icon: Info },
      { title: "Contact Page", href: "/dashboard/cms/contact", icon: Contact },
      { title: "Privacy Policy", href: "/dashboard/cms/privacy", icon: ShieldCheck },
      { title: "Terms of Service", href: "/dashboard/cms/terms", icon: FileLock2 },
    ],
  },
  {
    title: "Marketing",
    href: "/dashboard/marketing",
    icon: PercentSquare,
    items: [
      { title: "Discount Codes", href: "/dashboard/marketing/discounts", icon: PercentSquare },
      { title: "Newsletter", href: "/dashboard/marketing/newsletter", icon: Mail },
    ],
  },
  { title: "Settings", href: "/dashboard/settings", icon: Settings2 },
  {
    title: "Administration",
    href: "/dashboard/admin",
    icon: UserCog,
    items: [
      { title: "My Profile", href: "/dashboard/admin/profile", icon: UserCircle2 },
      { title: "Admin Users", href: "/dashboard/admin/users", icon: Users },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
      
      if (item.items && item.items.length > 0) {
        // Check if any sub-item is active to keep the collapsible open
        const isParentActive = item.items.some(subItem => pathname.startsWith(subItem.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Collapsible defaultOpen={isParentActive}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="w-full justify-between"
                  isActive={isActive && !item.items.some(subItem => pathname.startsWith(subItem.href))} // Active only if not a sub-item path
                  aria-expanded={isParentActive}
                  asChild={!isSubmenu && !item.items}
                >
                   <div className="flex items-center w-full">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                   </div>
                   <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {renderNavItems(item.items, true)}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      }

      const MenuButtonComponent = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      
      return (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <MenuButtonComponent isActive={isActive} tooltip={item.title}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </MenuButtonComponent>
          </Link>
        </SidebarMenuItem>
      );
    });
  };

  return <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>;
}

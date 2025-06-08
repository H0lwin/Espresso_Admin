
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ListOrdered,
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
  ChevronLeft,
  Home,
  Info,
  Package,
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
  { title: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
  { title: "سفارشات", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "منو", href: "/dashboard/menu", icon: ListOrdered },
  { title: "مشتریان", href: "/dashboard/customers", icon: Users },
  {
    title: "مدیریت محتوا",
    href: "/dashboard/cms",
    icon: LayoutPanelLeft,
    items: [
      { title: "صفحه اصلی", href: "/dashboard/cms/home", icon: Home },
      { title: "درباره ما", href: "/dashboard/cms/about", icon: Info },
      { title: "تماس با ما", href: "/dashboard/cms/contact", icon: Contact },
      { title: "سیاست حفظ حریم خصوصی", href: "/dashboard/cms/privacy", icon: ShieldCheck },
      { title: "شرایط خدمات", href: "/dashboard/cms/terms", icon: FileLock2 },
    ],
  },
  {
    title: "بازاریابی",
    href: "/dashboard/marketing",
    icon: PercentSquare,
    items: [
      { title: "کدهای تخفیف", href: "/dashboard/marketing/discounts", icon: PercentSquare },
      { title: "خبرنامه", href: "/dashboard/marketing/newsletter", icon: Mail },
    ],
  },
  { title: "تنظیمات", href: "/dashboard/settings", icon: Settings2 },
  {
    title: "مدیریت سیستم",
    href: "/dashboard/admin",
    icon: UserCog,
    items: [
      { title: "پروفایل من", href: "/dashboard/admin/profile", icon: UserCircle2 },
      { title: "کاربران ادمین", href: "/dashboard/admin/users", icon: Users },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[], isSubmenu = false) => {
    return items.map((item) => {
      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
      
      if (item.items && item.items.length > 0) {
        const isParentActive = item.items.some(subItem => pathname.startsWith(subItem.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Collapsible defaultOpen={isParentActive}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="w-full justify-between"
                  isActive={isActive && !item.items.some(subItem => pathname.startsWith(subItem.href))}
                  aria-expanded={isParentActive}
                  asChild={!isSubmenu && !item.items}
                >
                   <div className="flex items-center w-full">
                    <item.icon className="ms-2 h-4 w-4" />
                    <span>{item.title}</span>
                   </div>
                   <ChevronLeft className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:-rotate-90" />
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
              <item.icon className="ms-2 h-4 w-4" />
              <span>{item.title}</span>
            </MenuButtonComponent>
          </Link>
        </SidebarMenuItem>
      );
    });
  };

  return <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>;
}

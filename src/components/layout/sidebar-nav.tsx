
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
  Archive, // Icon for categories
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
  {
    title: "منو",
    href: "/dashboard/menu",
    icon: ListOrdered,
    items: [
      { title: "آیتم‌های منو", href: "/dashboard/menu", icon: ListOrdered },
      { title: "دسته‌بندی‌ها", href: "/dashboard/menu/categories", icon: Archive },
    ],
  },
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

  const renderNavItems = (items: NavItem[], isSubmenu = false, parentHref = "") => {
    return items.map((item) => {
      // For main menu items that have sub-items, their own href might also be a valid page.
      // The isActive check should handle this.
      // A menu item is active if the current pathname is exactly its href,
      // OR if it's a parent and the current pathname starts with its href (and it's not the dashboard itself),
      // OR if it's a sub-item and the current pathname is its href.
      let isActive = pathname === item.href;
      if (item.items && item.items.length > 0 && item.href !== "/dashboard") {
        // If it's a parent item, it's active if the path starts with its href
        // or if any of its children are active.
        isActive = isActive || pathname.startsWith(item.href) || item.items.some(subItem => pathname === subItem.href);
      }
       if (item.href === "/dashboard/menu" && pathname === "/dashboard/menu/categories") {
        isActive = false; // Ensure "Menu Items" is not active when "Categories" is active
      }


      if (item.items && item.items.length > 0) {
        const isParentActive = item.items.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href));
         // Special handling for parent "Menu" item if one of its children is active
        let isDirectlyActiveParent = pathname === item.href;
        if (item.href === "/dashboard/menu" && (pathname === "/dashboard/menu" || pathname === "/dashboard/menu/categories")) {
             isDirectlyActiveParent = (pathname === "/dashboard/menu" && !pathname.startsWith("/dashboard/menu/categories")) || item.items.some(subItem => pathname === subItem.href);
        }


        return (
          <SidebarMenuItem key={item.href}>
            <Collapsible defaultOpen={isParentActive}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="w-full justify-between"
                  isActive={isDirectlyActiveParent && !isParentActive && item.items.some(si => si.href === pathname) ? false : isDirectlyActiveParent}
                  aria-expanded={isParentActive}
                  asChild={false} // Ensure it's a button for CollapsibleTrigger
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
                  {renderNavItems(item.items, true, item.href)}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      }

      const MenuButtonComponent = isSubmenu ? SidebarMenuSubButton : SidebarMenuButton;
      
      // For direct links (not parents of submenus)
      let linkIsActive = pathname === item.href;
      if(parentHref === "/dashboard/menu" && item.href === "/dashboard/menu" && pathname.startsWith("/dashboard/menu/categories")) {
        linkIsActive = false; // "Menu Items" link should not be active if "Categories" page is active
      }


      return (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <MenuButtonComponent isActive={linkIsActive} tooltip={item.title}>
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


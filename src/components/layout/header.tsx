
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  UserCircle,
  LogOut,
  Settings,
  Moon,
  Sun,
  UserCircle2, // Added UserCircle2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function Header() {
  const { isMobile } = useSidebar();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {mounted && isMobile && (
        <SidebarTrigger className="md:hidden" />
      )}
      {!isMobile && (
         <div className={cn(
            "hidden md:block",
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useSidebar().state === "expanded" && "md:hidden"
          )}>
            <Logo size="sm" />
         </div>
      )}
      
      <div className="flex w-full items-center gap-4 md:ms-auto md:gap-2 lg:gap-4">
        <form className="me-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجو..."
              className="pr-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            />
          </div>
        </form>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="تغییر پوسته">
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">تغییر اعلان‌ها</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>اعلان‌ها</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 text-sm text-center text-muted-foreground">
              اعلان جدیدی وجود ندارد
            </div>
            {/* Example Notification Item
            <DropdownMenuItem className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">New order #12345</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            */}
             <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
                <Link href="#" className="text-sm text-primary">مشاهده همه اعلان‌ها</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="admin avatar" />
                <AvatarFallback>اد</AvatarFallback>
              </Avatar>
              <span className="sr-only">باز کردن منوی کاربر</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>حساب کاربری من</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/admin/profile" className="flex items-center">
                <UserCircle2 className="ms-2 h-4 w-4" />
                <span>پروفایل</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="ms-2 h-4 w-4" />
                <span>تنظیمات</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
               <Link href="/login" className="flex items-center">
                <LogOut className="ms-2 h-4 w-4" />
                <span>خروج</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

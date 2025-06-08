
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/lib/utils";

const loginFormSchema = z.object({
  email: z.string().email({ message: "لطفا یک آدرس ایمیل معتبر وارد کنید." }),
  password: z.string().min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const csrfToken = getCookie("csrftoken");
      const response = await fetch("/api/v1/auth/login/", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "X-CSRFToken": csrfToken }),
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // const data = await response.json(); 
        toast({
          title: "ورود موفق",
          description: "با موفقیت وارد شدید.",
        });
        // Assuming your API sets a session cookie upon successful login
        router.push("/dashboard");
      } else {
        const errorData = await response.json().catch(() => ({ detail: "ایمیل یا رمز عبور نامعتبر است." }));
        toast({
          title: "خطا در ورود",
          description: errorData.detail || "ایمیل یا رمز عبور نامعتبر است.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطا در ارتباط",
        description: "مشکلی در اتصال به سرور رخ داده است. لطفا دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-right">
          <CardTitle className="text-2xl font-headline">ورود ادمین</CardTitle>
          <CardDescription>برای دسترسی به داشبورد، اطلاعات خود را وارد کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@espressoedge.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          <span className="sr-only">{showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                ورود
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <Link href="#" className="text-primary hover:underline">
              رمز عبور را فراموش کرده‌اید؟
            </Link>
          </div>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} اسپرسو اِج. تمام حقوق محفوظ است.
      </p>
    </div>
  );
}

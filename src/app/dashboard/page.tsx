
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Mail,
  TrendingUp,
  PlusCircle,
  Settings,
  Coffee,
  Package,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: number | string;
  user: string;
  avatar: string; // Should be initials or a letter for placeholder
  action: string;
  time: string;
  type: string; // e.g., 'order', 'user', 'menu'
}

interface TopItem {
  id: number | string;
  name: string;
  category: string;
  sales: number;
  revenue: number; // Changed to number for easier formatting
}

interface DashboardStats {
  total_sales: number;
  total_orders: number;
  new_users: number;
  subscribers: number;
  top_item_name: string;
  total_sales_change: string; // e.g., "+5.2%"
  total_orders_change: string;
  new_users_change: string;
  subscribers_change_count: number; // e.g., 5 (new subscribers)
  top_item_sales_count: number;
}


const getIconForActivity = (type: string) => {
  switch (type) {
    case 'order': return <ShoppingCart className="h-4 w-4 text-primary" />;
    case 'user': return <Users className="h-4 w-4 text-blue-500" />;
    case 'menu': return <Coffee className="h-4 w-4 text-yellow-600" />;
    case 'review': return <TrendingUp className="h-4 w-4 text-green-500" />;
    default: return <Package className="h-4 w-4 text-gray-500" />;
  }
};

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [recentActivities, setRecentActivities] = React.useState<Activity[]>([]);
  const [topItems, setTopItems] = React.useState<TopItem[]>([]);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let activityError = false, topItemsError = false, statsError = false;

      try {
        const [activitiesRes, topItemsRes, statsRes] = await Promise.all([
          fetch("/api/v1/dashboard/recent-activities/").catch(() => { activityError = true; return null; }),
          fetch("/api/v1/dashboard/top-items/").catch(() => { topItemsError = true; return null; }),
          fetch("/api/v1/dashboard/stats/").catch(() => { statsError = true; return null; }),
        ]);

        if (activitiesRes && activitiesRes.ok) {
            const activitiesData = await activitiesRes.json();
            setRecentActivities(activitiesData.results || []);
        } else {
            activityError = true;
            setRecentActivities([]);
            const errorMsg = activitiesRes ? (await activitiesRes.json().catch(()=>({}))).detail || `Status: ${activitiesRes.status}` : "Network error";
            console.error("Failed to fetch recent activities:", errorMsg);
            toast({
              title: "خطا در بارگذاری فعالیت‌های اخیر",
              description: "امکان دریافت اطلاعات فعالیت‌های اخیر وجود نداشت.",
              variant: "destructive",
            });
        }

        if (topItemsRes && topItemsRes.ok) {
            const topItemsData = await topItemsRes.json();
            setTopItems(topItemsData.results || []);
        } else {
            topItemsError = true;
            setTopItems([]);
            const errorMsg = topItemsRes ? (await topItemsRes.json().catch(()=>({}))).detail || `Status: ${topItemsRes.status}` : "Network error";
            console.error("Failed to fetch top items:", errorMsg);
            toast({
              title: "خطا در بارگذاری آیتم‌های برتر",
              description: "امکان دریافت اطلاعات آیتم‌های پرفروش وجود نداشت.",
              variant: "destructive",
            });
        }

        if (statsRes && statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
        } else {
            statsError = true;
            setStats(null);
            let errorDetail = "امکان دریافت آمار کلی داشبورد وجود نداشت.";
            if (statsRes) {
                try {
                    const errorData = await statsRes.json();
                    errorDetail = errorData.detail || errorData.message || `خطای سرور: ${statsRes.status}`;
                } catch (e) {
                    errorDetail = `خطای شبکه یا پاسخ نامعتبر: ${statsRes.status}${statsRes.statusText ? ' - ' + statsRes.statusText : ''}`;
                }
            } else {
                errorDetail = "خطای شبکه در دریافت آمار داشبورد.";
            }
            console.error("Failed to fetch dashboard stats. Detail:", errorDetail, statsRes ? `Status: ${statsRes.status}`: "");
            toast({
              title: "خطا در بارگذاری آمار داشبورد",
              description: errorDetail,
              variant: "destructive",
            });
        }

      } catch (error: any) { // Catch-all for Promise.all or other unexpected errors
        console.error("Dashboard data fetch error:", error);
        toast({
          title: "خطا در ارتباط با سرور",
          description: "امکان بارگذاری کامل اطلاعات داشبورد وجود ندارد.",
          variant: "destructive",
        });
        setRecentActivities([]);
        setTopItems([]);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-lg">در حال بارگذاری اطلاعات داشبورد...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="نمای کلی داشبورد" description="خوش آمدید ادمین! آخرین وضعیت به شرح زیر است." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <StatCard title="کل فروش" value={`${(stats?.total_sales || 0).toLocaleString('fa-IR')} ریال`} icon={DollarSign} change={`${stats?.total_sales_change || "۰٪"}`} changeType={stats?.total_sales_change?.startsWith('-') ? "negative" : "positive"} />
        <StatCard title="کل سفارشات" value={(stats?.total_orders || 0).toLocaleString('fa-IR')} icon={ShoppingCart} change={`${stats?.total_orders_change || "۰٪"}`} changeType={stats?.total_orders_change?.startsWith('-') ? "negative" : "positive"} />
        <StatCard title="کاربران جدید" value={(stats?.new_users || 0).toLocaleString('fa-IR')} icon={Users} change={`${stats?.new_users_change || "۰٪"}`} changeType={stats?.new_users_change?.startsWith('-') ? "negative" : "positive"} />
        <StatCard title="مشترکین" value={(stats?.subscribers || 0).toLocaleString('fa-IR')} icon={Mail} change={`${(stats?.subscribers_change_count || 0) > 0 ? '+' : ''}${(stats?.subscribers_change_count || 0).toLocaleString('fa-IR')}`} changeType={(stats?.subscribers_change_count || 0) >= 0 ? "positive" : "negative"} />
        <StatCard title="آیتم برتر" value={stats?.top_item_name || "-"} icon={TrendingUp} change={`فروش ${(stats?.top_item_sales_count || 0).toLocaleString('fa-IR')} واحد`} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="default" onClick={() => router.push('/dashboard/orders')}><PlusCircle className="ms-2 h-4 w-4" /> سفارش جدید</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/menu')}><Coffee className="ms-2 h-4 w-4" /> افزودن آیتم منو</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/settings')}><Settings className="ms-2 h-4 w-4" /> تنظیمات سایت</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="text-right">
            <CardTitle>فعالیت‌های اخیر</CardTitle>
            <CardDescription>آخرین به‌روزرسانی‌ها و اقدامات در سراسر پلتفرم.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-reverse space-x-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${activity.avatar}`} alt={activity.user} data-ai-hint="user avatar"/>
                      <AvatarFallback>{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{activity.user}</span> {activity.action}.
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleString('fa-IR')}</p>
                    </div>
                    {getIconForActivity(activity.type)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                فعالیت اخیری یافت نشد.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-right">
            <CardTitle>آیتم‌های پرفروش</CardTitle>
            <CardDescription>محبوب‌ترین آیتم‌ها بر اساس فروش یا درآمد.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
              {topItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">آیتم</TableHead>
                      <TableHead className="text-center">فروش (تعداد)</TableHead>
                      <TableHead className="text-left">درآمد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topItems.slice(0, 5).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-right">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.category}</div>
                        </TableCell>
                        <TableCell className="text-center">{item.sales.toLocaleString('fa-IR')}</TableCell>
                        <TableCell className="text-left">{item.revenue.toLocaleString('fa-IR')} ریال</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">
                   آیتم پرفروشی یافت نشد.
                 </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


"use client";

import * as React from "react";
import { useRouter } from "next/navigation"; // Import useRouter
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
  avatar: string;
  action: string;
  time: string;
  type: string;
}

interface TopItem {
  id: number | string;
  name: string;
  category: string;
  sales: number;
  revenue: string; // Assuming revenue is formatted string from API
}

interface DashboardStats {
  totalSales: string;
  totalOrders: string;
  newUsers: string;
  subscribers: string;
  topItemName: string;
  totalSalesChange: string;
  totalOrdersChange: string;
  newUsersChange: string;
  subscribersChange: string;
  topItemSales: string;
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
  const router = useRouter(); // Initialize useRouter
  const [recentActivities, setRecentActivities] = React.useState<Activity[]>([]);
  const [topItems, setTopItems] = React.useState<TopItem[]>([]);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [activitiesRes, topItemsRes, statsRes] = await Promise.all([
          fetch("/api/v1/dashboard/recent-activities/"),
          fetch("/api/v1/dashboard/top-items/"),
          fetch("/api/v1/dashboard/stats/"),
        ]);

        let activitiesData, topItemsData, statsData;

        if (activitiesRes.ok) {
            activitiesData = await activitiesRes.json();
            setRecentActivities(activitiesData.results || []);
        } else {
            console.error("Failed to fetch recent activities:", activitiesRes.statusText);
            setRecentActivities([]); // Set to empty on error
            toast({
              title: "خطا در بارگذاری فعالیت‌های اخیر",
              description: "امکان دریافت اطلاعات فعالیت‌های اخیر وجود نداشت.",
              variant: "destructive",
            });
        }

        if (topItemsRes.ok) {
            topItemsData = await topItemsRes.json();
            setTopItems(topItemsData.results || []);
        } else {
            console.error("Failed to fetch top items:", topItemsRes.statusText);
            setTopItems([]); // Set to empty on error
            toast({
              title: "خطا در بارگذاری آیتم‌های برتر",
              description: "امکان دریافت اطلاعات آیتم‌های پرفروش وجود نداشت.",
              variant: "destructive",
            });
        }

        if (statsRes.ok) {
            statsData = await statsRes.json();
            setStats(statsData);
        } else {
            console.error("Failed to fetch dashboard stats:", statsRes.statusText);
            setStats(null); // Set to null on error
             toast({
              title: "خطا در بارگذاری آمار داشبورد",
              description: "امکان دریافت آمار کلی داشبورد وجود نداشت.",
              variant: "destructive",
            });
        }

      } catch (error: any) {
        toast({
          title: "خطا در ارتباط با سرور",
          description: error.message || "امکان بارگذاری کامل اطلاعات داشبورد وجود ندارد.",
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
        <StatCard title="کل فروش" value={stats?.totalSales || "۰ ریال"} icon={DollarSign} change={stats?.totalSalesChange || "۰٪"} changeType={stats?.totalSalesChange?.startsWith('-') ? "negative" : "positive"} />
        <StatCard title="کل سفارشات" value={stats?.totalOrders || "۰"} icon={ShoppingCart} change={stats?.totalOrdersChange || "۰٪"} changeType={stats?.totalOrdersChange?.startsWith('-') ? "negative" : "positive"} />
        <StatCard title="کاربران جدید" value={stats?.newUsers || "۰"} icon={Users} change={stats?.newUsersChange || "۰٪"} changeType={stats?.newUsersChange?.startsWith('-') ? "negative" : "positive"} />
        <StatCard title="مشترکین" value={stats?.subscribers || "۰"} icon={Mail} change={stats?.subscribersChange || "۰"} changeType="positive" />
        <StatCard title="آیتم برتر" value={stats?.topItemName || "-"} icon={TrendingUp} change={`فروش ${stats?.topItemSales || "۰"} واحد`} />
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
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${activity.avatar}`} alt={activity.user} data-ai-hint="user avatar" />
                      <AvatarFallback>{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{activity.user}</span> {activity.action}.
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    {getIconForActivity(activity.type)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isLoading ? "در حال بارگذاری فعالیت‌ها..." : "فعالیت اخیری یافت نشد."}
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
                      <TableHead className="text-center">فروش</TableHead>
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
                        <TableCell className="text-left">{item.revenue.toLocaleString('fa-IR')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">
                   {isLoading ? "در حال بارگذاری آیتم‌ها..." : "آیتم پرفروشی یافت نشد."}
                 </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

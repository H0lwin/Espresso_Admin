import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  className?: string;
}

export function StatCard({ title, value, icon: Icon, change, changeType, className }: StatCardProps) {
  return (
    <Card className={cn("shadow-lg hover:shadow-xl transition-shadow duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline text-foreground">{value}</div>
        {change && (
          <p className={cn(
            "text-xs text-muted-foreground mt-1",
            changeType === 'positive' && "text-green-600",
            changeType === 'negative' && "text-red-600"
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp, UserPlus, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const UserAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    growthRate: 0,
  });

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalRes, newTodayRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", today.toISOString()),
      ]);

      const totalUsers = totalRes.count || 0;
      const newUsersToday = newTodayRes.count || 0;
      
      // Calculate growth rate (simplified - comparing new today vs average)
      const growthRate = totalUsers > 0 ? ((newUsersToday / totalUsers) * 100).toFixed(1) : 0;

      setAnalytics({
        totalUsers,
        newUsersToday,
        activeUsers: totalUsers, // Simplified - could be enhanced with session tracking
        growthRate: Number(growthRate),
      });
    } catch (error) {
      console.error("Error fetching user analytics:", error);
    }
  };

  const analyticsData = [
    { label: "Total Users", value: analytics.totalUsers, icon: Users, color: "text-blue-500" },
    { label: "New Today", value: analytics.newUsersToday, icon: UserPlus, color: "text-green-500" },
    { label: "Active Users", value: analytics.activeUsers, icon: Activity, color: "text-purple-500" },
    { label: "Growth Rate", value: `${analytics.growthRate}%`, icon: TrendingUp, color: "text-orange-500" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-primary" />
          User Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-4">
          {analyticsData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <item.icon className={item.color} size={20} />
              </div>
              <div className="text-2xl font-bold text-foreground">{item.value}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

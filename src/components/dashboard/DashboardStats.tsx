import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, TrendingUp, Activity, Target } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalEvents: number;
    totalUsers: number;
    totalAttendance: number;
    averageAttendance: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      description: 'Events created',
      icon: Calendar,
      gradient: 'gradient-blue',
      textGradient: 'text-gradient-blue',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'gradient-blue'
    },
    {
      title: 'Brigade Leads',
      value: stats.totalUsers,
      description: 'Registered leads & co-leads',
      icon: Users,
      gradient: 'gradient-green',
      textGradient: 'text-gradient-green',
      bgGradient: 'from-green-50 to-green-100',
      iconBg: 'gradient-green'
    },
    {
      title: 'Total Attendance',
      value: stats.totalAttendance,
      description: 'Records marked',
      icon: Activity,
      gradient: 'gradient-purple',
      textGradient: 'text-gradient-purple',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'gradient-purple'
    },
    {
      title: 'Average Attendance',
      value: `${stats.averageAttendance}%`,
      description: 'Overall attendance rate',
      icon: Target,
      gradient: 'gradient-orange',
      textGradient: 'text-gradient-orange',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'gradient-orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className={`card-enhanced bg-gradient-to-br ${stat.bgGradient} border-2 border-white/50 shadow-2xl hover-lift animate-scale-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-black text-gray-800">
                {stat.title}
              </CardTitle>
              <div className={`p-4 rounded-2xl ${stat.iconBg} shadow-xl hover-glow`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-3xl sm:text-4xl font-black ${stat.textGradient} mb-3`}>
                {stat.value}
              </div>
              <CardDescription className="text-sm text-gray-700 font-bold">
                {stat.description}
              </CardDescription>
              <div className={`w-full h-2 ${stat.gradient} rounded-full mt-4 shadow-lg`}></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
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
      color: 'icon-blue',
      bgColor: 'bg-blue-light'
    },
    {
      title: 'Brigade Leads',
      value: stats.totalUsers,
      description: 'Registered leads & co-leads',
      icon: Users,
      color: 'icon-green',
      bgColor: 'bg-green-light'
    },
    {
      title: 'Total Attendance',
      value: stats.totalAttendance,
      description: 'Records marked',
      icon: Activity,
      color: 'icon-purple',
      bgColor: 'bg-purple-light'
    },
    {
      title: 'Average Attendance',
      value: `${stats.averageAttendance}%`,
      description: 'Overall attendance rate',
      icon: Target,
      color: 'icon-orange',
      bgColor: 'bg-orange-light'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-compact hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <CardDescription className="text-xs text-gray-600">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
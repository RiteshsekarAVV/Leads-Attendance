import { useMemo } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { useEventsData, useUsersData, useAttendanceData } from '@/hooks/useFirestore';
import { BarChart3, TrendingUp, Users, Calendar, Activity, Target } from 'lucide-react';

export const Dashboard = () => {
  const { events } = useEventsData();
  const { users } = useUsersData();
  const { attendance } = useAttendanceData();

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalUsers = users.length;
    const totalAttendance = attendance.filter(record => record.isPresent).length;
    const averageAttendance = totalUsers > 0 && totalEvents > 0 
      ? Math.round((totalAttendance / (totalUsers * totalEvents * 2)) * 100) 
      : 0;

    return {
      totalEvents,
      totalUsers,
      totalAttendance,
      averageAttendance
    };
  }, [events, users, attendance]);

  const sessionData = useMemo(() => {
    return events.map(event => ({
      name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
      fn: attendance.filter(record => 
        record.eventId === event.id && 
        record.sessionType === 'FN' && 
        record.isPresent
      ).length,
      an: attendance.filter(record => 
        record.eventId === event.id && 
        record.sessionType === 'AN' && 
        record.isPresent
      ).length
    }));
  }, [events, attendance]);

  const brigadeData = useMemo(() => {
    const brigadeMap = new Map();
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
    
    users.forEach(user => {
      const userAttendance = attendance.filter(record => 
        record.userId === user.id && record.isPresent
      ).length;
      
      const currentCount = brigadeMap.get(user.brigadeName) || 0;
      brigadeMap.set(user.brigadeName, currentCount + userAttendance);
    });

    return Array.from(brigadeMap.entries()).map(([name, attendance], index) => ({
      name: name.replace(' Brigade', ''),
      attendance,
      color: colors[index % colors.length]
    }));
  }, [users, attendance]);

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="card-enhanced rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
              <div className="p-4 sm:p-6 gradient-primary rounded-3xl shadow-2xl animate-float hover-glow">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gradient-primary mb-3">
                  Dashboard
                </h1>
                <div className="w-24 sm:w-32 h-1.5 gradient-primary rounded-full mx-auto lg:mx-0"></div>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl leading-relaxed font-semibold mt-4">
                  Comprehensive overview of brigade lead attendance and performance metrics with real-time insights
                </p>
              </div>
            </div>
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[
                { 
                  icon: Calendar, 
                  label: 'Total Events', 
                  value: stats.totalEvents, 
                  gradient: 'gradient-blue',
                  textGradient: 'text-gradient-blue',
                  bg: 'from-blue-50 to-blue-100' 
                },
                { 
                  icon: Users, 
                  label: 'Brigade Leads', 
                  value: stats.totalUsers, 
                  gradient: 'gradient-green',
                  textGradient: 'text-gradient-green',
                  bg: 'from-green-50 to-green-100' 
                },
                { 
                  icon: Activity, 
                  label: 'Total Attendance', 
                  value: stats.totalAttendance, 
                  gradient: 'gradient-purple',
                  textGradient: 'text-gradient-purple',
                  bg: 'from-purple-50 to-purple-100' 
                },
                { 
                  icon: Target, 
                  label: 'Avg Attendance', 
                  value: `${stats.averageAttendance}%`, 
                  gradient: 'gradient-orange',
                  textGradient: 'text-gradient-orange',
                  bg: 'from-orange-50 to-orange-100' 
                }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className={`card-enhanced rounded-2xl p-4 sm:p-6 bg-gradient-to-br ${stat.bg} hover-lift border-2 border-white/50`} 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-3 sm:p-4 rounded-2xl ${stat.gradient} shadow-xl hover-glow`}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className={`text-2xl sm:text-3xl lg:text-4xl font-black ${stat.textGradient}`}>
                      {stat.value}
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-700">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="animate-slide-in-right">
          <DashboardStats stats={stats} />
        </div>

        {/* Charts Section */}
        <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <AttendanceChart sessionData={sessionData} brigadeData={brigadeData} />
        </div>
      </div>
    </div>
  );
};
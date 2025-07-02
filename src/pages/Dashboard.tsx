import { useMemo } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { useEventsData, useUsersData, useAttendanceData } from '@/hooks/useFirestore';
import { BarChart3, Calendar, Activity, Users, Target } from 'lucide-react';

export const Dashboard = () => {
  const { events } = useEventsData();
  const { users } = useUsersData();
  const { attendance } = useAttendanceData();

  // Get ongoing events (events that have at least one day that is today or in the future)
  const ongoingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => 
      event.days.some(day => {
        const eventDay = new Date(day.date);
        return eventDay >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
      })
    );
  }, [events]);

  // Filter attendance to only include records from ongoing events
  const ongoingAttendance = useMemo(() => {
    const ongoingEventIds = new Set(ongoingEvents.map(e => e.id));
    return attendance.filter(record => ongoingEventIds.has(record.eventId));
  }, [attendance, ongoingEvents]);

  const stats = useMemo(() => {
    const totalEvents = ongoingEvents.length;
    const totalUsers = users.length;
    
    // Calculate total attendance from actual attendance records marked as present for ongoing events
    const totalAttendance = ongoingAttendance.filter(record => record.isPresent).length;
    
    // Calculate total possible attendance slots for ongoing events only
    let totalPossibleAttendance = 0;
    
    ongoingEvents.forEach(event => {
      event.days.forEach(day => {
        let activeSessions = 0;
        if (day.fnSession.isActive) activeSessions++;
        if (day.anSession.isActive) activeSessions++;
        totalPossibleAttendance += (activeSessions * totalUsers);
      });
    });
    
    const averageAttendance = totalPossibleAttendance > 0 
      ? Math.round((totalAttendance / totalPossibleAttendance) * 100) 
      : 0;

    return {
      totalEvents,
      totalUsers,
      totalAttendance,
      averageAttendance
    };
  }, [ongoingEvents, users, ongoingAttendance]);

  const sessionData = useMemo(() => {
    return ongoingEvents.map(event => ({
      name: event.name.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
      fn: ongoingAttendance.filter(record => 
        record.eventId === event.id && 
        record.sessionType === 'FN' && 
        record.isPresent
      ).length,
      an: ongoingAttendance.filter(record => 
        record.eventId === event.id && 
        record.sessionType === 'AN' && 
        record.isPresent
      ).length
    }));
  }, [ongoingEvents, ongoingAttendance]);

  const brigadeData = useMemo(() => {
    const brigadeMap = new Map();
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
    
    users.forEach(user => {
      const userAttendance = ongoingAttendance.filter(record => 
        record.userId === user.id && record.isPresent
      ).length;
      
      const currentCount = brigadeMap.get(user.brigadeName) || 0;
      brigadeMap.set(user.brigadeName, currentCount + userAttendance);
    });

    return Array.from(brigadeMap.entries()).map(([name, attendance], index) => ({
      name: (name || '').replace(' Brigade', ''),
      attendance,
      color: colors[index % colors.length]
    }));
  }, [users, ongoingAttendance]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-light rounded-lg">
              <BarChart3 className="h-6 w-6 icon-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Overview of ongoing events and brigade lead attendance metrics</p>
            </div>
          </div>
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                icon: Calendar, 
                label: 'Ongoing Events', 
                value: stats.totalEvents, 
                color: 'icon-blue',
                bgColor: 'bg-blue-light'
              },
              { 
                icon: Users, 
                label: 'Brigade Leads', 
                value: stats.totalUsers, 
                color: 'icon-green',
                bgColor: 'bg-green-light'
              },
              { 
                icon: Activity, 
                label: 'Total Attendance', 
                value: stats.totalAttendance, 
                color: 'icon-purple',
                bgColor: 'bg-purple-light'
              },
              { 
                icon: Target, 
                label: 'Avg Attendance', 
                value: `${stats.averageAttendance}%`, 
                color: 'icon-orange',
                bgColor: 'bg-orange-light'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <DashboardStats stats={stats} />

        {/* Charts Section */}
        <AttendanceChart sessionData={sessionData} brigadeData={brigadeData} />
      </div>
    </div>
  );
};
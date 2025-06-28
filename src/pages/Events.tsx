import { useState } from 'react';
import { EventList } from '@/components/events/EventList';
import { AttendanceMarking } from '@/components/attendance/AttendanceMarking';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Sparkles, Activity, Users, Clock } from 'lucide-react';
import { useEventsData, useUsersData } from '@/hooks/useFirestore';
import { Event } from '@/types';

export const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { events, loading: eventsLoading } = useEventsData();
  const { users } = useUsersData();

  if (selectedEvent) {
    return (
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 xl:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedEvent(null)}
              className="btn-primary hover-lift border-2 font-semibold shadow-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Back to Events</span>
            </Button>
          </div>
          
          <AttendanceMarking event={selectedEvent} users={users} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="card-enhanced rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
              <div className="p-4 sm:p-6 gradient-green rounded-3xl shadow-2xl animate-float hover-glow">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gradient-green mb-3">
                  Events Management
                </h1>
                <div className="w-32 sm:w-40 h-1.5 gradient-green rounded-full mx-auto lg:mx-0"></div>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl leading-relaxed font-semibold mt-4">
                  Manage events and their attendance sessions with comprehensive control and real-time monitoring
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="glass p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-4 gradient-blue rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gradient-blue mb-2">
                  {events.length}
                </div>
                <p className="text-sm text-gray-700 font-bold">Total Events</p>
              </div>
              <div className="glass p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-4 gradient-purple rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gradient-purple mb-2">
                  {events.filter(e => e.fnSession.isActive || e.anSession.isActive).length}
                </div>
                <p className="text-sm text-gray-700 font-bold">Active Events</p>
              </div>
              <div className="glass p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-4 gradient-orange rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-black text-gradient-orange mb-2">
                  {events.reduce((acc, e) => acc + e.fnSession.attendanceCount + e.anSession.attendanceCount, 0)}
                </div>
                <p className="text-sm text-gray-700 font-bold">Total Attendance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {eventsLoading ? (
          <div className="card-enhanced rounded-3xl shadow-2xl p-16 text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-200 border-t-green-600 mx-auto mb-8"></div>
            <p className="text-gray-700 text-2xl font-bold">Loading events...</p>
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <div className="animate-slide-in-left">
            <EventList events={events} onEventSelect={setSelectedEvent} />
          </div>
        )}
      </div>
    </div>
  );
};
import { useState } from 'react';
import { EventList } from '@/components/events/EventList';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { AttendanceMarking } from '@/components/attendance/AttendanceMarking';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Activity, Users } from 'lucide-react';
import { useEventsData, useUsersData } from '@/hooks/useFirestore';
import { Event } from '@/types';

export const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<{ event: Event; date?: Date } | null>(null);
  const { events, loading: eventsLoading } = useEventsData();
  const { users } = useUsersData();

  const handleEventSelect = (event: Event, selectedDate?: Date) => {
    setSelectedEvent({ event, date: selectedDate });
  };

  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedEvent(null)}
              className="border-gray-300 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
          
          <AttendanceMarking 
            event={selectedEvent.event} 
            selectedDate={selectedEvent.date}
            users={users} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Events Management
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Manage events and their attendance sessions with comprehensive control and real-time monitoring
              </p>
            </div>
            <CreateEventModal />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {events.length}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Total Events</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {events.filter(e => e.days.some(d => d.fnSession.isActive || d.anSession.isActive)).length}
                  </div>
                  <p className="text-sm text-green-700 font-medium">Active Events</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {events.reduce((acc, e) => acc + e.days.reduce((dayAcc, d) => dayAcc + d.fnSession.attendanceCount + d.anSession.attendanceCount, 0), 0)}
                  </div>
                  <p className="text-sm text-purple-700 font-medium">Total Attendance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {eventsLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading events...</p>
          </div>
        ) : (
          <EventList events={events} onEventSelect={handleEventSelect} />
        )}
      </div>
    </div>
  );
};
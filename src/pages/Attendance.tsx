import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceMarking } from '@/components/attendance/AttendanceMarking';
import { Calendar, CheckSquare, Users, Activity, Target, AlertCircle } from 'lucide-react';
import { useEventsData, useUsersData } from '@/hooks/useFirestore';
import { format } from 'date-fns';
import { getTodaysEventDays } from '@/utils/timeUtils';

export const Attendance = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const { events, loading: eventsLoading } = useEventsData();
  const { users } = useUsersData();

  // Get today's events only
  const todaysEvents = getTodaysEventDays(events);
  const selectedEvent = events.find(event => event.id === selectedEventId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-light rounded-lg">
              <CheckSquare className="h-6 w-6 icon-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
              <p className="text-gray-600">Select an event to mark attendance for brigade leads and co-leads (Today Only)</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-light rounded-lg">
                  <Calendar className="h-5 w-5 icon-blue" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {todaysEvents.length}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Today's Events</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-light rounded-lg">
                  <Users className="h-5 w-5 icon-green" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {users.length}
                  </div>
                  <p className="text-sm text-green-700 font-medium">Brigade Leads</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-light rounded-lg">
                  <Activity className="h-5 w-5 icon-purple" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {todaysEvents.filter(e => e.day.fnSession.isActive).length}
                  </div>
                  <p className="text-sm text-purple-700 font-medium">FN Active Today</p>
                </div>
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-light rounded-lg">
                  <Target className="h-5 w-5 icon-pink" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-900">
                    {todaysEvents.filter(e => e.day.anSession.isActive).length}
                  </div>
                  <p className="text-sm text-pink-700 font-medium">AN Active Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Selection */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-light rounded-lg">
                <Calendar className="h-5 w-5 icon-blue" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">Select Today's Event</CardTitle>
                <CardDescription>
                  Choose an event scheduled for today to mark attendance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todaysEvents.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Today</h3>
                <p className="text-gray-500">
                  There are no events scheduled for today ({format(new Date(), 'MMMM d, yyyy')}).
                </p>
                <p className="text-gray-500 mt-2">
                  Attendance can only be marked for events happening today.
                </p>
              </div>
            ) : (
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select today's event to begin attendance marking" />
                </SelectTrigger>
                <SelectContent>
                  {todaysEvents.map((todayEvent) => (
                    <SelectItem key={todayEvent.eventId} value={todayEvent.eventId}>
                      <div className="flex items-center space-x-3">
                        <div className="p-1 bg-blue-light rounded-md">
                          <Calendar className="h-3 w-3 icon-blue" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{todayEvent.eventName}</div>
                          <div className="text-xs text-gray-500">
                            Today - {format(new Date(), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Attendance Marking */}
        {selectedEvent ? (
          <AttendanceMarking event={selectedEvent} users={users} />
        ) : eventsLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading events...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
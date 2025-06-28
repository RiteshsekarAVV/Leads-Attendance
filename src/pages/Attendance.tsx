import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceMarking } from '@/components/attendance/AttendanceMarking';
import { Calendar, CheckSquare, Clock, Users, Activity, Target } from 'lucide-react';
import { useEventsData, useUsersData } from '@/hooks/useFirestore';
import { Event } from '@/types';
import { format } from 'date-fns';

export const Attendance = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const { events, loading: eventsLoading } = useEventsData();
  const { users } = useUsersData();

  const selectedEvent = events.find(event => event.id === selectedEventId);

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="card-enhanced rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
              <div className="p-4 sm:p-6 gradient-orange rounded-3xl shadow-2xl animate-float hover-glow">
                <CheckSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gradient-orange mb-3">
                  Mark Attendance
                </h1>
                <div className="w-36 sm:w-44 h-1.5 gradient-orange rounded-full mx-auto lg:mx-0"></div>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl leading-relaxed font-semibold mt-4">
                  Select an event to mark attendance for brigade leads and co-leads with real-time session tracking
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-blue rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-blue mb-1">
                  {events.length}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">Total Events</p>
              </div>
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-green rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-green mb-1">
                  {users.length}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">Brigade Leads</p>
              </div>
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-purple rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-purple mb-1">
                  {events.filter(e => e.fnSession.isActive).length}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">FN Active</p>
              </div>
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-pink rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-pink mb-1">
                  {events.filter(e => e.anSession.isActive).length}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">AN Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Selection */}
        <Card className="card-enhanced max-w-3xl mx-auto shadow-2xl border-2 border-white/50 hover-lift animate-scale-in">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="p-4 gradient-blue rounded-2xl shadow-xl hover-glow">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl font-black text-gradient-blue">
                  Select Event
                </CardTitle>
                <CardDescription className="text-gray-700 font-semibold text-base">
                  Choose an event to mark attendance for both FN and AN sessions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="select-enhanced h-16 text-base font-semibold">
                <SelectValue placeholder="Select an event to begin attendance marking" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-2 border-white/50">
                {events.map((event) => (
                  <SelectItem 
                    key={event.id} 
                    value={event.id}
                    className="rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-semibold"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 gradient-blue rounded-lg shadow-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{event.name}</div>
                        <div className="text-sm text-gray-600 font-medium">{format(event.date, 'MMM d, yyyy')}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Attendance Marking */}
        {selectedEvent ? (
          <div className="animate-slide-in-left">
            <AttendanceMarking event={selectedEvent} users={users} />
          </div>
        ) : eventsLoading ? (
          <div className="card-enhanced rounded-3xl shadow-2xl p-16 text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-600 mx-auto mb-8"></div>
            <p className="text-gray-700 text-2xl font-bold">Loading events...</p>
            <div className="flex justify-center space-x-2 mt-6">
              <div className="w-3 h-3 bg-orange-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          events.length === 0 && (
            <Card className="card-enhanced shadow-2xl border-2 border-white/50 rounded-3xl">
              <CardContent className="text-center py-16">
                <div className="p-8 gradient-orange rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-2xl">
                  <Calendar className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-6">No Events Available</h3>
                <p className="text-gray-700 text-xl font-semibold">Create an event first to start marking attendance for your brigade leads.</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};
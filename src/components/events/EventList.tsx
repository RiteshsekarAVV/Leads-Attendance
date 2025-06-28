import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Users, Trash2 } from 'lucide-react';
import { Event } from '@/types';
import { format, isSameDay } from 'date-fns';
import { formatTimeRange, getSessionStatus } from '@/utils/timeUtils';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';

interface EventListProps {
  events: Event[];
  onEventSelect?: (event: Event, selectedDate?: Date) => void;
}

export const EventList = ({ events, onEventSelect }: EventListProps) => {
  const { updateEvent, deleteEvent, loading } = useFirestore();

  const handleSessionToggle = async (event: Event, dayIndex: number, sessionType: 'fnSession' | 'anSession', isActive: boolean) => {
    const updatedDays = [...event.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      [sessionType]: {
        ...updatedDays[dayIndex][sessionType],
        isActive
      }
    };

    const result = await updateEvent(event.id, { days: updatedDays });
    if (result.success) {
      toast.success(`${sessionType === 'fnSession' ? 'FN' : 'AN'} session ${isActive ? 'activated' : 'suspended'}`);
    } else {
      toast.error('Failed to update session status');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const result = await deleteEvent(eventId);
      if (result.success) {
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-500">Create your first event to get started with attendance tracking.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <Card key={event.id} className="border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">{event.name}</CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(event.startDate, 'MMM d')} - {format(event.endDate, 'MMM d, yyyy')}
                  </span>
                  <span className="text-blue-600 font-medium">
                    {event.days.length} day{event.days.length > 1 ? 's' : ''}
                  </span>
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={loading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {event.days.map((day, dayIndex) => {
                const fnStatus = getSessionStatus(day.fnSession.startTime, day.fnSession.endTime);
                const anStatus = getSessionStatus(day.anSession.startTime, day.anSession.endTime);
                const isToday = isSameDay(day.date, new Date());

                return (
                  <div key={dayIndex} className={`p-4 rounded-lg border ${isToday ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          {format(day.date, 'EEEE, MMM d')}
                        </h4>
                        {isToday && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Today</Badge>
                        )}
                      </div>
                      {onEventSelect && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEventSelect(event, day.date)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Mark Attendance
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* FN Session */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm text-blue-700">FN Session</h5>
                          <Switch
                            checked={day.fnSession.isActive}
                            onCheckedChange={(checked) => handleSessionToggle(event, dayIndex, 'fnSession', checked)}
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {formatTimeRange(day.fnSession.startTime, day.fnSession.endTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={fnStatus.status === 'active' ? 'default' : 
                                    fnStatus.status === 'upcoming' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {fnStatus.message}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {day.fnSession.attendanceCount} attended
                          </span>
                        </div>
                      </div>

                      {/* AN Session */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm text-green-700">AN Session</h5>
                          <Switch
                            checked={day.anSession.isActive}
                            onCheckedChange={(checked) => handleSessionToggle(event, dayIndex, 'anSession', checked)}
                            disabled={loading}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">
                            {formatTimeRange(day.anSession.startTime, day.anSession.endTime)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={anStatus.status === 'active' ? 'default' : 
                                    anStatus.status === 'upcoming' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {anStatus.message}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {day.anSession.attendanceCount} attended
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
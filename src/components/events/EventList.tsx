import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, Users, Edit, Trash2 } from 'lucide-react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { formatTimeRange, getSessionStatus } from '@/utils/timeUtils';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';

interface EventListProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

export const EventList = ({ events, onEventSelect }: EventListProps) => {
  const { updateEvent, deleteEvent, loading } = useFirestore();

  const handleSessionToggle = async (event: Event, sessionType: 'fn' | 'an', isActive: boolean) => {
    const updateData = {
      [`${sessionType}Session`]: {
        ...event[`${sessionType}Session`],
        isActive
      }
    };

    const result = await updateEvent(event.id, updateData);
    if (result.success) {
      toast.success(`${sessionType.toUpperCase()} session ${isActive ? 'activated' : 'suspended'}`);
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
    <div className="space-y-4">
      {events.map((event) => {
        const fnStatus = getSessionStatus(event.fnSession.startTime, event.fnSession.endTime);
        const anStatus = getSessionStatus(event.anSession.startTime, event.anSession.endTime);

        return (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{event.name}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(event.date, 'MMMM d, yyyy')}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {onEventSelect && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEventSelect(event)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Mark Attendance
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FN Session */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">FN Session</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Active</span>
                      <Switch
                        checked={event.fnSession.isActive}
                        onCheckedChange={(checked) => handleSessionToggle(event, 'fn', checked)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {formatTimeRange(event.fnSession.startTime, event.fnSession.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={fnStatus.status === 'active' ? 'default' : 
                              fnStatus.status === 'upcoming' ? 'secondary' : 'destructive'}
                    >
                      {fnStatus.message}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {event.fnSession.attendanceCount} attended
                    </span>
                  </div>
                </div>

                {/* AN Session */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">AN Session</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Active</span>
                      <Switch
                        checked={event.anSession.isActive}
                        onCheckedChange={(checked) => handleSessionToggle(event, 'an', checked)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {formatTimeRange(event.anSession.startTime, event.anSession.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={anStatus.status === 'active' ? 'default' : 
                              anStatus.status === 'upcoming' ? 'secondary' : 'destructive'}
                    >
                      {anStatus.message}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {event.anSession.attendanceCount} attended
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
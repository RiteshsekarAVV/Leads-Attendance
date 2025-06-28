import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, Clock } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';

export const CreateEventForm = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [fnStartTime, setFnStartTime] = useState('09:00');
  const [fnEndTime, setFnEndTime] = useState('12:00');
  const [anStartTime, setAnStartTime] = useState('13:00');
  const [anEndTime, setAnEndTime] = useState('16:00');
  
  const { addEvent, loading } = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventName || !eventDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventData = {
      name: eventName,
      date: new Date(eventDate),
      fnSession: {
        isActive: true,
        startTime: fnStartTime,
        endTime: fnEndTime,
        attendanceCount: 0
      },
      anSession: {
        isActive: true,
        startTime: anStartTime,
        endTime: anEndTime,
        attendanceCount: 0
      }
    };

    const result = await addEvent(eventData);
    
    if (result.success) {
      toast.success('Event created successfully!');
      // Reset form
      setEventName('');
      setEventDate('');
      setFnStartTime('09:00');
      setFnEndTime('12:00');
      setAnStartTime('13:00');
      setAnEndTime('16:00');
    } else {
      toast.error(result.error || 'Failed to create event');
    }
  };

  return (
    <Card className="max-w-4xl bg-white/80 backdrop-blur-sm shadow-xl border border-white/20 hover-lift">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-xl sm:text-2xl">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <span>Create New Event</span>
        </CardTitle>
        <CardDescription className="text-base">
          Set up a new event with FN and AN sessions for attendance tracking
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="eventName" className="text-sm font-semibold text-gray-700">
                Event Name *
              </Label>
              <Input
                id="eventName"
                placeholder="e.g., Tech Workshop 2024"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="eventDate" className="text-sm font-semibold text-gray-700">
                Event Date *
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Session Times */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Session Times</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* FN Session */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-700 text-lg flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>FN Session (Forenoon)</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fnStartTime" className="text-sm font-medium text-gray-700">
                      Start Time
                    </Label>
                    <Input
                      id="fnStartTime"
                      type="time"
                      value={fnStartTime}
                      onChange={(e) => setFnStartTime(e.target.value)}
                      className="h-10 border-2 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fnEndTime" className="text-sm font-medium text-gray-700">
                      End Time
                    </Label>
                    <Input
                      id="fnEndTime"
                      type="time"
                      value={fnEndTime}
                      onChange={(e) => setFnEndTime(e.target.value)}
                      className="h-10 border-2 border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* AN Session */}
              <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-700 text-lg flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>AN Session (Afternoon)</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="anStartTime" className="text-sm font-medium text-gray-700">
                      Start Time
                    </Label>
                    <Input
                      id="anStartTime"
                      type="time"
                      value={anStartTime}
                      onChange={(e) => setAnStartTime(e.target.value)}
                      className="h-10 border-2 border-green-200 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anEndTime" className="text-sm font-medium text-gray-700">
                      End Time
                    </Label>
                    <Input
                      id="anEndTime"
                      type="time"
                      value={anEndTime}
                      onChange={(e) => setAnEndTime(e.target.value)}
                      className="h-10 border-2 border-green-200 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Event...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
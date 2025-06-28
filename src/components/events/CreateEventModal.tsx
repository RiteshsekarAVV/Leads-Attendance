import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Loader2, Clock, Plus } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';
import { format, eachDayOfInterval } from 'date-fns';

export const CreateEventModal = () => {
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dayConfigs, setDayConfigs] = useState<any[]>([]);
  
  const { addEvent, loading } = useFirestore();

  const handleDateRangeChange = () => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      toast.error('End date must be after start date');
      return;
    }
    
    const days = eachDayOfInterval({ start, end });
    const configs = days.map(date => ({
      date,
      fnSession: {
        isActive: true,
        startTime: '09:00',
        endTime: '12:00',
        attendanceCount: 0
      },
      anSession: {
        isActive: true,
        startTime: '13:00',
        endTime: '16:00',
        attendanceCount: 0
      }
    }));
    
    setDayConfigs(configs);
  };

  const updateDayConfig = (dayIndex: number, sessionType: 'fnSession' | 'anSession', field: string, value: any) => {
    setDayConfigs(prev => prev.map((day, index) => 
      index === dayIndex 
        ? {
            ...day,
            [sessionType]: {
              ...day[sessionType],
              [field]: value
            }
          }
        : day
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventName || !startDate || !endDate || dayConfigs.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventData = {
      name: eventName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days: dayConfigs
    };

    const result = await addEvent(eventData);
    
    if (result.success) {
      toast.success('Event created successfully!');
      setOpen(false);
      // Reset form
      setEventName('');
      setStartDate('');
      setEndDate('');
      setDayConfigs([]);
    } else {
      toast.error(result.error || 'Failed to create event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            <span>Create New Event</span>
          </DialogTitle>
          <DialogDescription>
            Set up a new multi-day event with customizable FN and AN sessions
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="e.g., Tech Workshop 2024"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate) handleDateRangeChange();
                }}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (startDate) handleDateRangeChange();
                }}
                required
              />
            </div>
          </div>

          {startDate && endDate && (
            <Button 
              type="button" 
              onClick={handleDateRangeChange}
              variant="outline"
              className="w-full"
            >
              Generate Day Configurations
            </Button>
          )}

          {/* Day Configurations */}
          {dayConfigs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Day-wise Session Configuration</span>
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dayConfigs.map((day, dayIndex) => (
                  <Card key={dayIndex} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {format(day.date, 'EEEE, MMMM d, yyyy')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* FN Session */}
                        <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-blue-700">FN Session</h4>
                            <Switch
                              checked={day.fnSession.isActive}
                              onCheckedChange={(checked) => 
                                updateDayConfig(dayIndex, 'fnSession', 'isActive', checked)
                              }
                            />
                          </div>
                          {day.fnSession.isActive && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Start Time</Label>
                                <Input
                                  type="time"
                                  value={day.fnSession.startTime}
                                  onChange={(e) => 
                                    updateDayConfig(dayIndex, 'fnSession', 'startTime', e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">End Time</Label>
                                <Input
                                  type="time"
                                  value={day.fnSession.endTime}
                                  onChange={(e) => 
                                    updateDayConfig(dayIndex, 'fnSession', 'endTime', e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AN Session */}
                        <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-green-700">AN Session</h4>
                            <Switch
                              checked={day.anSession.isActive}
                              onCheckedChange={(checked) => 
                                updateDayConfig(dayIndex, 'anSession', 'isActive', checked)
                              }
                            />
                          </div>
                          {day.anSession.isActive && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Start Time</Label>
                                <Input
                                  type="time"
                                  value={day.anSession.startTime}
                                  onChange={(e) => 
                                    updateDayConfig(dayIndex, 'anSession', 'startTime', e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">End Time</Label>
                                <Input
                                  type="time"
                                  value={day.anSession.endTime}
                                  onChange={(e) => 
                                    updateDayConfig(dayIndex, 'anSession', 'endTime', e.target.value)
                                  }
                                  className="h-8"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading || dayConfigs.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
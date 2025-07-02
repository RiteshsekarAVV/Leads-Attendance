import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Edit, Loader2, Clock, Save } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Event } from '@/types';

interface EditEventModalProps {
  event: Event;
}

export const EditEventModal = ({ event }: EditEventModalProps) => {
  const [open, setOpen] = useState(false);
  const [dayConfigs, setDayConfigs] = useState(event.days);
  
  const { updateEvent, loading } = useFirestore();

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
    
    const result = await updateEvent(event.id, { days: dayConfigs });
    
    if (result.success) {
      toast.success('Event updated successfully!');
      setOpen(false);
    } else {
      toast.error(result.error || 'Failed to update event');
    }
  };

  const handleCancel = () => {
    setDayConfigs(event.days);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Edit Event - {event.name}</span>
          </DialogTitle>
          <DialogDescription>
            Modify session timings and availability for each day
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Day Configurations */}
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
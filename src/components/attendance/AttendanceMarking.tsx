import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckSquare, AlertCircle, Users, Calendar } from 'lucide-react';
import { Event, User, AttendanceRecord } from '@/types';
import { isWithinTimeRange, formatTimeRange, getSessionStatus } from '@/utils/timeUtils';
import { useFirestore } from '@/hooks/useFirestore';
import { useAttendanceData } from '@/hooks/useFirestore';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';

interface AttendanceMarkingProps {
  event: Event;
  selectedDate?: Date;
  users: User[];
}

export const AttendanceMarking = ({ event, selectedDate, users }: AttendanceMarkingProps) => {
  const [activeTab, setActiveTab] = useState('fn');
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || event.days[0]?.date || new Date());
  const { markAttendance, updateAttendance, loading } = useFirestore();
  const { attendance } = useAttendanceData(event.id);

  const currentDay = event.days.find(day => isSameDay(day.date, currentDate));

  const fnCanMark = currentDay?.fnSession.isActive && isWithinTimeRange(
    currentDay.fnSession.startTime, 
    currentDay.fnSession.endTime
  );
  
  const anCanMark = currentDay?.anSession.isActive && isWithinTimeRange(
    currentDay.anSession.startTime, 
    currentDay.anSession.endTime
  );

  const fnStatus = currentDay ? getSessionStatus(currentDay.fnSession.startTime, currentDay.fnSession.endTime) : null;
  const anStatus = currentDay ? getSessionStatus(currentDay.anSession.startTime, currentDay.anSession.endTime) : null;

  const getAttendanceRecord = (userId: string, sessionType: 'FN' | 'AN') => {
    return attendance.find(record => 
      record.userId === userId && 
      record.sessionType === sessionType &&
      isSameDay(record.eventDate, currentDate)
    );
  };

  const handleAttendanceToggle = async (user: User, sessionType: 'FN' | 'AN', isPresent: boolean) => {
    const existingRecord = getAttendanceRecord(user.id, sessionType);
    
    if (existingRecord) {
      // Update existing record
      const result = await updateAttendance(existingRecord.id, { isPresent });
      if (result.success) {
        toast.success(`Attendance ${isPresent ? 'marked' : 'unmarked'} for ${user.fullName}`);
      } else {
        toast.error('Failed to update attendance');
      }
    } else {
      // Create new record
      const result = await markAttendance({
        eventId: event.id,
        eventDate: currentDate,
        userId: user.id,
        sessionType,
        isPresent,
        markedBy: 'admin' // In a real app, this would be the current user's ID
      });
      
      if (result.success) {
        toast.success(`Attendance ${isPresent ? 'marked' : 'unmarked'} for ${user.fullName}`);
      } else {
        toast.error('Failed to mark attendance');
      }
    }
  };

  const renderSessionContent = (sessionType: 'FN' | 'AN') => {
    if (!currentDay) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No session data available for this date.</p>
        </div>
      );
    }

    const canMark = sessionType === 'FN' ? fnCanMark : anCanMark;
    const session = sessionType === 'FN' ? currentDay.fnSession : currentDay.anSession;
    const status = sessionType === 'FN' ? fnStatus : anStatus;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {sessionType} Session - {format(currentDate, 'MMM d, yyyy')}
            </h3>
            <p className="text-sm text-gray-500">
              {formatTimeRange(session.startTime, session.endTime)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={status?.status === 'active' ? 'default' : 
                      status?.status === 'upcoming' ? 'secondary' : 'destructive'}
            >
              {status?.message}
            </Badge>
            {session.isActive ? (
              <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-200">Suspended</Badge>
            )}
          </div>
        </div>

        {!session.isActive && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This session has been suspended by the administrator.
            </AlertDescription>
          </Alert>
        )}

        {session.isActive && !canMark && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Attendance marking is only allowed during the session time window: {formatTimeRange(session.startTime, session.endTime)}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          {users.map((user) => {
            const attendanceRecord = getAttendanceRecord(user.id, sessionType);
            const isPresent = attendanceRecord?.isPresent || false;
            
            return (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.rollNumber} • {user.brigadeName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${user.id}-${sessionType}`}
                      checked={isPresent}
                      onCheckedChange={(checked) => 
                        handleAttendanceToggle(user, sessionType, checked as boolean)
                      }
                      disabled={!canMark || !session.isActive || loading}
                    />
                    <label 
                      htmlFor={`${user.id}-${sessionType}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Present
                    </label>
                  </div>
                  
                  {isPresent && (
                    <CheckSquare className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No brigade leads found. Add some users first.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Mark Attendance - {event.name}</CardTitle>
        <CardDescription>
          Mark attendance for brigade leads and co-leads for each session
        </CardDescription>
        
        {/* Date Selector */}
        {event.days.length > 1 && (
          <div className="flex items-center space-x-4 pt-4">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select 
              value={format(currentDate, 'yyyy-MM-dd')} 
              onValueChange={(value) => setCurrentDate(new Date(value))}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {event.days.map((day, index) => (
                  <SelectItem key={index} value={format(day.date, 'yyyy-MM-dd')}>
                    {format(day.date, 'EEEE, MMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fn" className="flex items-center space-x-2">
              <span>FN Session</span>
              {currentDay && currentDay.fnSession.attendanceCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentDay.fnSession.attendanceCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="an" className="flex items-center space-x-2">
              <span>AN Session</span>
              {currentDay && currentDay.anSession.attendanceCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentDay.anSession.attendanceCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="fn" className="mt-6">
            {renderSessionContent('FN')}
          </TabsContent>
          
          <TabsContent value="an" className="mt-6">
            {renderSessionContent('AN')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
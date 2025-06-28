import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, AlertCircle, Users, Check, X, UserCheck } from 'lucide-react';
import { Event, User } from '@/types';
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Automatically select today's date if it exists in the event days, otherwise use the first day
  const [currentDate] = useState<Date>(() => {
    if (selectedDate) return selectedDate;
    
    // Find today's date in the event days
    const today = new Date();
    const todayInEvent = event.days.find(day => isSameDay(day.date, today));
    
    if (todayInEvent) {
      return today;
    }
    
    // If today is not in the event, use the first day
    return event.days[0]?.date || new Date();
  });
  
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
        toast.success(`${user.fullName} marked as ${isPresent ? 'Present' : 'Absent'}`);
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
        markedBy: 'admin'
      });
      
      if (result.success) {
        toast.success(`${user.fullName} marked as ${isPresent ? 'Present' : 'Absent'}`);
      } else {
        toast.error('Failed to mark attendance');
      }
    }
  };

  const handleBulkAttendance = async (sessionType: 'FN' | 'AN', isPresent: boolean) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    const promises = selectedUsers.map(async (userId) => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const existingRecord = getAttendanceRecord(userId, sessionType);
      
      if (existingRecord) {
        return updateAttendance(existingRecord.id, { isPresent });
      } else {
        return markAttendance({
          eventId: event.id,
          eventDate: currentDate,
          userId,
          sessionType,
          isPresent,
          markedBy: 'admin'
        });
      }
    });

    try {
      await Promise.all(promises);
      toast.success(`${selectedUsers.length} users marked as ${isPresent ? 'Present' : 'Absent'}`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Failed to update bulk attendance');
    }
  };

  const getUnmarkedUsers = (sessionType: 'FN' | 'AN') => {
    return users.filter(user => !getAttendanceRecord(user.id, sessionType));
  };

  const handleSelectAllUnmarked = (sessionType: 'FN' | 'AN', checked: boolean) => {
    if (checked) {
      const unmarkedUsers = getUnmarkedUsers(sessionType);
      setSelectedUsers(unmarkedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
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
    const unmarkedUsers = getUnmarkedUsers(sessionType);
    
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
            {/* Only show Active badge if session is active AND within time range */}
            {session.isActive && status?.status === 'active' && (
              <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
            )}
            {/* Show Suspended badge if session is not active */}
            {!session.isActive && (
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

        {/* Bulk Actions */}
        {canMark && session.isActive && unmarkedUsers.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedUsers.length === unmarkedUsers.length && unmarkedUsers.length > 0}
                  onCheckedChange={(checked) => handleSelectAllUnmarked(sessionType, checked as boolean)}
                />
                <span className="font-medium text-gray-900">
                  Select All Unmarked ({selectedUsers.length} selected)
                </span>
              </div>
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleBulkAttendance(sessionType, true)}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Mark Present ({selectedUsers.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAttendance(sessionType, false)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Mark Absent ({selectedUsers.length})
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {users.map((user) => {
            const attendanceRecord = getAttendanceRecord(user.id, sessionType);
            const isPresent = attendanceRecord?.isPresent;
            const hasRecord = attendanceRecord !== undefined;
            
            return (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  {canMark && session.isActive && !hasRecord && (
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelect(user.id, checked as boolean)}
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.rollNumber} • {user.brigadeName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Present Button */}
                  <Button
                    size="sm"
                    variant={isPresent === true ? "default" : "outline"}
                    onClick={() => handleAttendanceToggle(user, sessionType, true)}
                    disabled={!canMark || !session.isActive || loading || hasRecord}
                    className={`${
                      isPresent === true 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    } ${hasRecord ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Present
                  </Button>
                  
                  {/* Absent Button */}
                  <Button
                    size="sm"
                    variant={isPresent === false ? "default" : "outline"}
                    onClick={() => handleAttendanceToggle(user, sessionType, false)}
                    disabled={!canMark || !session.isActive || loading || hasRecord}
                    className={`${
                      isPresent === false 
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    } ${hasRecord ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Absent
                  </Button>
                  
                  {/* Status Indicator */}
                  {hasRecord && (
                    <div className="flex items-center">
                      {isPresent ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Marked Present
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Marked Absent
                        </Badge>
                      )}
                    </div>
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
          Mark attendance for brigade leads and co-leads for {format(currentDate, 'MMMM d, yyyy')}
        </CardDescription>
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
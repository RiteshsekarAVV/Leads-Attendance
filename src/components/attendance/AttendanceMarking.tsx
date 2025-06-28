import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckSquare, AlertCircle, Users } from 'lucide-react';
import { Event, User, AttendanceRecord } from '@/types';
import { isWithinTimeRange, formatTimeRange, getSessionStatus } from '@/utils/timeUtils';
import { useFirestore } from '@/hooks/useFirestore';
import { useAttendanceData } from '@/hooks/useFirestore';
import { toast } from 'sonner';

interface AttendanceMarkingProps {
  event: Event;
  users: User[];
}

export const AttendanceMarking = ({ event, users }: AttendanceMarkingProps) => {
  const [activeTab, setActiveTab] = useState('fn');
  const { markAttendance, updateAttendance, loading } = useFirestore();
  const { attendance } = useAttendanceData(event.id);

  const fnCanMark = event.fnSession.isActive && isWithinTimeRange(
    event.fnSession.startTime, 
    event.fnSession.endTime
  );
  
  const anCanMark = event.anSession.isActive && isWithinTimeRange(
    event.anSession.startTime, 
    event.anSession.endTime
  );

  const fnStatus = getSessionStatus(event.fnSession.startTime, event.fnSession.endTime);
  const anStatus = getSessionStatus(event.anSession.startTime, event.anSession.endTime);

  const getAttendanceRecord = (userId: string, sessionType: 'FN' | 'AN') => {
    return attendance.find(record => 
      record.userId === userId && 
      record.sessionType === sessionType
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
    const canMark = sessionType === 'FN' ? fnCanMark : anCanMark;
    const session = sessionType === 'FN' ? event.fnSession : event.anSession;
    const status = sessionType === 'FN' ? fnStatus : anStatus;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">
              {sessionType} Session - {event.name}
            </h3>
            <p className="text-sm text-gray-500">
              {formatTimeRange(session.startTime, session.endTime)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={status.status === 'active' ? 'default' : 
                      status.status === 'upcoming' ? 'secondary' : 'destructive'}
            >
              {status.message}
            </Badge>
            {session.isActive ? (
              <Badge variant="outline" className="text-green-600">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-red-600">Suspended</Badge>
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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
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
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance - {event.name}</CardTitle>
        <CardDescription>
          Mark attendance for brigade leads and co-leads for each session
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fn" className="flex items-center space-x-2">
              <span>FN Session</span>
              {event.fnSession.attendanceCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {event.fnSession.attendanceCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="an" className="flex items-center space-x-2">
              <span>AN Session</span>
              {event.anSession.attendanceCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {event.anSession.attendanceCount}
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
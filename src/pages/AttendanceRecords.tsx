import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, FileText, Users, Activity, Calendar, AlertTriangle } from 'lucide-react';
import { useEventsData, useUsersData, useAttendanceData } from '@/hooks/useFirestore';
import { exportAttendanceData } from '@/utils/excelUtils';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';

export const AttendanceRecords = () => {
  const [selectedEventDate, setSelectedEventDate] = useState('all');
  const [selectedBrigade, setSelectedBrigade] = useState('all');
  const [selectedSession, setSelectedSession] = useState('FN');

  const { events } = useEventsData();
  const { users } = useUsersData();
  const { attendance } = useAttendanceData();

  // Get ongoing events (events that have at least one day that is today or in the future)
  const ongoingEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => 
      event.days.some(day => {
        const eventDay = new Date(day.date);
        return eventDay >= new Date(today.getFullYear(), today.getMonth(), today.getDate());
      })
    );
  }, [events]);

  // Get unique event dates from ongoing events
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    ongoingEvents.forEach(event => {
      event.days.forEach(day => {
        dates.add(format(day.date, 'yyyy-MM-dd'));
      });
    });
    return Array.from(dates).sort();
  }, [ongoingEvents]);

  // Get unique brigades
  const brigades = useMemo(() => {
    const uniqueBrigades = [...new Set(users.map(user => user.brigadeName))];
    return uniqueBrigades.sort();
  }, [users]);

  // Get all records (both marked and unmarked) for the selected filters
  const allRecords = useMemo(() => {
    const records: any[] = [];
    
    // If no specific date is selected, return empty array to avoid confusion
    if (selectedEventDate === 'all') {
      return [];
    }

    // Find the selected date
    const selectedDate = new Date(selectedEventDate);
    
    // Find events that have sessions on the selected date
    const eventsOnDate = ongoingEvents.filter(event =>
      event.days.some(day => isSameDay(day.date, selectedDate))
    );

    eventsOnDate.forEach(event => {
      const eventDay = event.days.find(day => isSameDay(day.date, selectedDate));
      if (!eventDay) return;

      // Check if the selected session is active for this day
      const sessionActive = selectedSession === 'FN' 
        ? eventDay.fnSession.isActive 
        : eventDay.anSession.isActive;

      if (!sessionActive) return;

      // Filter users by brigade if selected
      const filteredUsers = selectedBrigade === 'all' 
        ? users 
        : users.filter(user => user.brigadeName === selectedBrigade);

      filteredUsers.forEach(user => {
        // Check if attendance record exists
        const attendanceRecord = attendance.find(record =>
          record.eventId === event.id &&
          record.userId === user.id &&
          record.sessionType === selectedSession &&
          isSameDay(record.eventDate, selectedDate)
        );

        if (attendanceRecord) {
          // User has attendance record
          records.push({
            id: attendanceRecord.id,
            eventId: event.id,
            eventName: event.name,
            eventDate: selectedDate,
            userId: user.id,
            userName: user.fullName,
            userRollNumber: user.rollNumber,
            userBrigade: user.brigadeName,
            sessionType: selectedSession,
            isPresent: attendanceRecord.isPresent,
            markedAt: attendanceRecord.markedAt,
            markedBy: attendanceRecord.markedBy,
            hasRecord: true
          });
        } else {
          // User doesn't have attendance record (not marked)
          records.push({
            id: `unmarked-${event.id}-${user.id}-${selectedSession}`,
            eventId: event.id,
            eventName: event.name,
            eventDate: selectedDate,
            userId: user.id,
            userName: user.fullName,
            userRollNumber: user.rollNumber,
            userBrigade: user.brigadeName,
            sessionType: selectedSession,
            isPresent: null,
            markedAt: null,
            markedBy: null,
            hasRecord: false
          });
        }
      });
    });

    return records;
  }, [ongoingEvents, users, attendance, selectedEventDate, selectedBrigade, selectedSession]);

  // Prepare data for export
  const exportData = useMemo(() => {
    return allRecords.map(record => ({
      'Event Name': record.eventName,
      'Date': format(record.eventDate, 'yyyy-MM-dd'),
      'Session': record.sessionType,
      'Full Name': record.userName,
      'Roll Number': record.userRollNumber,
      'Brigade': record.userBrigade,
      'Status': record.hasRecord 
        ? (record.isPresent ? 'Present' : 'Absent')
        : 'Not Marked',
      'Marked At': record.markedAt ? format(record.markedAt, 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      'Marked By': record.markedBy || 'N/A'
    }));
  }, [allRecords]);

  const handleExport = () => {
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    // Generate filename based on filters
    const dateName = selectedEventDate === 'all' ? 'All Dates' : selectedEventDate;
    const brigadeName = selectedBrigade === 'all' ? 'All Brigades' : selectedBrigade;
    const sessionName = selectedSession;
    
    const filename = `Attendance_${dateName}_${brigadeName}_${sessionName}`;
    
    exportAttendanceData(exportData, filename);
    toast.success(`Exported ${exportData.length} attendance records`);
  };

  const clearFilters = () => {
    setSelectedEventDate('all');
    setSelectedBrigade('all');
    setSelectedSession('FN');
  };

  // Calculate stats for filtered data
  const stats = useMemo(() => {
    const totalRecords = allRecords.length;
    const markedRecords = allRecords.filter(r => r.hasRecord).length;
    const presentRecords = allRecords.filter(r => r.hasRecord && r.isPresent).length;
    const absentRecords = allRecords.filter(r => r.hasRecord && !r.isPresent).length;
    const notMarkedRecords = allRecords.filter(r => !r.hasRecord).length;
    const attendanceRate = markedRecords > 0 ? Math.round((presentRecords / markedRecords) * 100) : 0;

    return {
      totalRecords,
      markedRecords,
      presentRecords,
      absentRecords,
      notMarkedRecords,
      attendanceRate
    };
  }, [allRecords]);

  // Debug information for the 105 records issue
  const debugInfo = useMemo(() => {
    if (selectedEventDate === 'all') return null;
    
    const duplicateCheck = new Map();
    const duplicates: any[] = [];
    
    attendance.forEach(record => {
      if (format(record.eventDate, 'yyyy-MM-dd') === selectedEventDate && 
          record.sessionType === selectedSession) {
        const key = `${record.eventId}-${record.userId}-${record.sessionType}-${format(record.eventDate, 'yyyy-MM-dd')}`;
        if (duplicateCheck.has(key)) {
          duplicates.push({
            original: duplicateCheck.get(key),
            duplicate: record
          });
        } else {
          duplicateCheck.set(key, record);
        }
      }
    });

    const totalAttendanceForDate = attendance.filter(record =>
      format(record.eventDate, 'yyyy-MM-dd') === selectedEventDate && 
      record.sessionType === selectedSession
    ).length;

    return {
      totalUsers: users.length,
      totalAttendanceRecords: totalAttendanceForDate,
      duplicates: duplicates.length,
      duplicateDetails: duplicates
    };
  }, [attendance, selectedEventDate, selectedSession, users]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Attendance Records
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                View, filter, and export attendance records for ongoing events (including unmarked users)
              </p>
            </div>
            <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export ({allRecords.length})
            </Button>
          </div>
          
          {/* Debug Info */}
          {debugInfo && debugInfo.duplicates > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-800">Data Issue Detected</h3>
              </div>
              <p className="text-red-700 text-sm">
                Found {debugInfo.duplicates} duplicate attendance records for {selectedEventDate} {selectedSession} session. 
                Total records: {debugInfo.totalAttendanceRecords}, Total users: {debugInfo.totalUsers}
              </p>
              <details className="mt-2">
                <summary className="text-red-700 text-sm cursor-pointer">View duplicate details</summary>
                <div className="mt-2 text-xs text-red-600">
                  {debugInfo.duplicateDetails.map((dup, index) => (
                    <div key={index} className="mb-1">
                      Duplicate {index + 1}: User {dup.duplicate.userId} has multiple records
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
          
          {/* Stats for filtered data */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.totalRecords}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {stats.presentRecords}
                  </div>
                  <p className="text-sm text-green-700 font-medium">Present</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-900">
                    {stats.absentRecords}
                  </div>
                  <p className="text-sm text-red-700 font-medium">Absent</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.notMarkedRecords}
                  </div>
                  <p className="text-sm text-yellow-700 font-medium">Not Marked</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.attendanceRate}%
                  </div>
                  <p className="text-sm text-purple-700 font-medium">Attendance Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
              </div>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Event Date *</span>
                </label>
                <Select value={selectedEventDate} onValueChange={setSelectedEventDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a specific date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" disabled>Select a specific date</SelectItem>
                    {eventDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), 'MMM d, yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  * Please select a specific date to view attendance records
                </p>
              </div>

              {/* Brigade Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brigade</label>
                <Select value={selectedBrigade} onValueChange={setSelectedBrigade}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brigades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brigades</SelectItem>
                    {brigades.map((brigade) => (
                      <SelectItem key={brigade} value={brigade}>
                        {brigade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Session</label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FN">Forenoon (FN)</SelectItem>
                    <SelectItem value="AN">Afternoon (AN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">
              Attendance Records ({allRecords.length})
            </CardTitle>
            <CardDescription>
              {selectedEventDate === 'all' 
                ? 'Please select a specific event date to view attendance records'
                : `Showing all users for ${format(new Date(selectedEventDate), 'MMM d, yyyy')} - ${selectedSession} session`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedEventDate === 'all' ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Event Date</h3>
                <p className="text-gray-500">
                  Please select a specific event date from the filters above to view attendance records.
                </p>
              </div>
            ) : allRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                <p className="text-gray-500">
                  No events or sessions found for the selected date and filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Session</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Brigade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marked At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRecords.map((record) => (
                      <TableRow key={record.id} className={!record.hasRecord ? 'bg-yellow-50' : ''}>
                        <TableCell className="font-medium">
                          {record.eventName}
                        </TableCell>
                        <TableCell>
                          {format(record.eventDate, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {record.sessionType}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.userName}</TableCell>
                        <TableCell>{record.userRollNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {record.userBrigade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.hasRecord ? (
                            <Badge 
                              className={`text-xs ${
                                record.isPresent 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.isPresent ? 'Present' : 'Absent'}
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-yellow-100 text-yellow-800">
                              Not Marked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {record.markedAt ? format(record.markedAt, 'MMM d, HH:mm') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
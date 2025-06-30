import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Filter, FileText, Users, Activity } from 'lucide-react';
import { useEventsData, useUsersData, useAttendanceData } from '@/hooks/useFirestore';
import { exportAttendanceData } from '@/utils/excelUtils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const AttendanceRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedBrigade, setSelectedBrigade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { events } = useEventsData();
  const { users } = useUsersData();
  const { attendance } = useAttendanceData();

  // Get unique brigades
  const brigades = useMemo(() => {
    const uniqueBrigades = [...new Set(users.map(user => user.brigadeName))];
    return uniqueBrigades.sort();
  }, [users]);

  // Filter attendance records
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      const user = users.find(u => u.id === record.userId);
      const event = events.find(e => e.id === record.eventId);
      
      if (!user || !event) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !user.fullName.toLowerCase().includes(searchLower) &&
          !user.rollNumber.toLowerCase().includes(searchLower) &&
          !user.brigadeName.toLowerCase().includes(searchLower) &&
          !event.name.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Event filter
      if (selectedEvent !== 'all' && record.eventId !== selectedEvent) {
        return false;
      }

      // Brigade filter
      if (selectedBrigade !== 'all' && user.brigadeName !== selectedBrigade) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'present' && !record.isPresent) return false;
        if (selectedStatus === 'absent' && record.isPresent) return false;
      }

      // Session filter
      if (selectedSession !== 'all') {
        const sessionType = record.sessionType?.toLowerCase();
        if (selectedSession === 'forenoon' && sessionType !== 'forenoon') return false;
        if (selectedSession === 'afternoon' && sessionType !== 'afternoon') return false;
      }

      // Date range filter
      if (startDate && record.eventDate < new Date(startDate)) {
        return false;
      }
      if (endDate && record.eventDate > new Date(endDate)) {
        return false;
      }

      return true;
    });
  }, [attendance, users, events, searchTerm, selectedEvent, selectedBrigade, selectedStatus, selectedSession, startDate, endDate]);

  // Prepare data for export
  const exportData = useMemo(() => {
    return filteredAttendance.map(record => {
      const user = users.find(u => u.id === record.userId);
      const event = events.find(e => e.id === record.eventId);
      
      return {
        'Event Name': event?.name || 'Unknown Event',
        'Date': format(record.eventDate, 'yyyy-MM-dd'),
        'Session': record.sessionType,
        'Full Name': user?.fullName || 'Unknown User',
        'Roll Number': user?.rollNumber || 'N/A',
        'Brigade': user?.brigadeName || 'N/A',
        'Status': record.isPresent ? 'Present' : 'Absent',
        'Marked At': format(record.markedAt, 'yyyy-MM-dd HH:mm:ss'),
        'Marked By': record.markedBy
      };
    });
  }, [filteredAttendance, users, events]);

  const handleExport = () => {
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    // Generate filename based on filters
    const eventName = selectedEvent === 'all' ? 'All Events' : 
      events.find(e => e.id === selectedEvent)?.name || 'Unknown Event';
    const brigadeName = selectedBrigade === 'all' ? 'All Brigades' : selectedBrigade;
    const statusName = selectedStatus === 'all' ? 'All Status' : 
      selectedStatus === 'present' ? 'Present' : 'Absent';
    const sessionName = selectedSession === 'all' ? 'All Sessions' : 
      selectedSession === 'forenoon' ? 'Forenoon' : 'Afternoon';
    const startDateStr = startDate || 'No Start Date';
    const endDateStr = endDate || 'No End Date';
    
    const filename = `${eventName}+${brigadeName}+${statusName}+${sessionName}+${startDateStr}+${endDateStr}`;
    
    exportAttendanceData(exportData, filename);
    toast.success(`Exported ${exportData.length} attendance records`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEvent('all');
    setSelectedBrigade('all');
    setSelectedStatus('all');
    setSelectedSession('all');
    setStartDate('');
    setEndDate('');
  };

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const totalRecords = filteredAttendance.length;
    const presentRecords = filteredAttendance.filter(r => r.isPresent).length;
    const absentRecords = totalRecords - presentRecords;
    const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    // Session-specific stats
    const forenoonRecords = filteredAttendance.filter(r => r.sessionType?.toLowerCase() === 'forenoon');
    const afternoonRecords = filteredAttendance.filter(r => r.sessionType?.toLowerCase() === 'afternoon');
    
    const forenoonPresent = forenoonRecords.filter(r => r.isPresent).length;
    const afternoonPresent = afternoonRecords.filter(r => r.isPresent).length;
    
    const forenoonRate = forenoonRecords.length > 0 ? Math.round((forenoonPresent / forenoonRecords.length) * 100) : 0;
    const afternoonRate = afternoonRecords.length > 0 ? Math.round((afternoonPresent / afternoonRecords.length) * 100) : 0;

    return {
      totalRecords,
      presentRecords,
      absentRecords,
      attendanceRate,
      forenoonRecords: forenoonRecords.length,
      afternoonRecords: afternoonRecords.length,
      forenoonPresent,
      afternoonPresent,
      forenoonRate,
      afternoonRate
    };
  }, [filteredAttendance]);

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
                View, filter, and export all attendance records with comprehensive filtering options
              </p>
            </div>
            <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export ({filteredAttendance.length})
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.totalRecords}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Total Records</p>
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

          {/* Session-specific stats - only show when session filter is applied */}
          {selectedSession !== 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-orange-900">
                      {selectedSession === 'forenoon' ? stats.forenoonRate : stats.afternoonRate}%
                    </div>
                    <p className="text-sm text-orange-700 font-medium">
                      {selectedSession === 'forenoon' ? 'Forenoon' : 'Afternoon'} Attendance
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-orange-600">
                      {selectedSession === 'forenoon' ? stats.forenoonPresent : stats.afternoonPresent} / {selectedSession === 'forenoon' ? stats.forenoonRecords : stats.afternoonRecords}
                    </div>
                    <p className="text-xs text-orange-500">Present / Total</p>
                  </div>
                </div>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-cyan-900">
                      {selectedSession === 'forenoon' ? stats.afternoonRate : stats.forenoonRate}%
                    </div>
                    <p className="text-sm text-cyan-700 font-medium">
                      {selectedSession === 'forenoon' ? 'Afternoon' : 'Forenoon'} Comparison
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-cyan-600">
                      {selectedSession === 'forenoon' ? stats.afternoonPresent : stats.forenoonPresent} / {selectedSession === 'forenoon' ? stats.afternoonRecords : stats.forenoonRecords}
                    </div>
                    <p className="text-xs text-cyan-500">Present / Total</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Name, roll number, brigade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Event Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Event</label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectValue placeholder="All Sessions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="forenoon">Forenoon</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">
              Attendance Records ({filteredAttendance.length})
            </CardTitle>
            <CardDescription>
              Showing {filteredAttendance.length} of {attendance.length} total records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                <p className="text-gray-500">
                  {attendance.length === 0 
                    ? 'No attendance records have been created yet.'
                    : 'Try adjusting your filters to see more results.'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {filteredAttendance.map((record) => {
                      const user = users.find(u => u.id === record.userId);
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            {format(record.eventDate, 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                record.sessionType?.toLowerCase() === 'forenoon' 
                                  ? 'bg-orange-50 text-orange-700 border-orange-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {record.sessionType}
                            </Badge>
                          </TableCell>
                          <TableCell>{user?.fullName || 'Unknown User'}</TableCell>
                          <TableCell>{user?.rollNumber || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {user?.brigadeName || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`text-xs ${
                                record.isPresent 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {record.isPresent ? 'Present' : 'Absent'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(record.markedAt, 'MMM d, HH:mm')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
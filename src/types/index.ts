export interface User {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  brigadeName: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  days: EventDay[];
  createdAt: Date;
}

export interface EventDay {
  date: Date;
  fnSession: Session;
  anSession: Session;
}

export interface Session {
  isActive: boolean;
  startTime: string;
  endTime: string;
  attendanceCount: number;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventDate: Date;
  userId: string;
  sessionType: 'FN' | 'AN';
  isPresent: boolean;
  markedAt: Date;
  markedBy: string;
}

export interface Analytics {
  totalEvents: number;
  totalUsers: number;
  overallAttendance: number;
  brigadeStats: BrigadeStats[];
  sessionComparison: SessionStats;
  topPerformers: UserStats[];
}

export interface BrigadeStats {
  brigadeName: string;
  totalMembers: number;
  attendancePercentage: number;
  fnAttendance: number;
  anAttendance: number;
}

export interface SessionStats {
  fnTotal: number;
  anTotal: number;
  fnPercentage: number;
  anPercentage: number;
}

export interface UserStats {
  fullName: string;
  brigadeName: string;
  attendancePercentage: number;
  totalEvents: number;
  attendedEvents: number;
}
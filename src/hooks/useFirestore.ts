import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, User, AttendanceRecord, Brigade } from '@/types';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);

  // Events
  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date()
      });
      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'events', eventId), updates);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const deleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Users
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        createdAt: new Date()
      });
      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const addUsersBulk = async (users: Omit<User, 'id' | 'createdAt'>[]) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      users.forEach((userData) => {
        const docRef = doc(collection(db, 'users'));
        batch.set(docRef, {
          ...userData,
          createdAt: new Date()
        });
      });

      await batch.commit();
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Brigades
  const addBrigade = async (brigadeData: Omit<Brigade, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'brigades'), {
        ...brigadeData,
        createdAt: new Date()
      });
      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const deleteBrigade = async (brigadeId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'brigades', brigadeId));
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Attendance
  const markAttendance = async (attendanceData: Omit<AttendanceRecord, 'id' | 'markedAt'>) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'attendance'), {
        ...attendanceData,
        markedAt: new Date()
      });
      setLoading(false);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const updateAttendance = async (attendanceId: string, updates: Partial<AttendanceRecord>) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'attendance', attendanceId), updates);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    addUser,
    addUsersBulk,
    updateUser,
    deleteUser,
    addBrigade,
    deleteBrigade,
    markAttendance,
    updateAttendance
  };
};

export const useEventsData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Safely convert Firestore timestamps to Date objects
        const eventData: Event = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate || Date.now()),
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate || Date.now()),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
          // Handle days array if it exists
          days: data.days ? data.days.map((day: any) => ({
            ...day,
            date: day.date?.toDate ? day.date.toDate() : new Date(day.date || Date.now())
          })) : []
        } as Event;
        
        eventsData.push(eventData);
      });
      setEvents(eventsData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { events, loading };
};

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        usersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        } as User);
      });
      setUsers(usersData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { users, loading };
};

export const useBrigadesData = () => {
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'brigades'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const brigadesData: Brigade[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        brigadesData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now())
        } as Brigade);
      });
      setBrigades(brigadesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { brigades, loading };
};

export const useAttendanceData = (eventId?: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (eventId) {
      q = query(
        collection(db, 'attendance'),
        where('eventId', '==', eventId),
        orderBy('markedAt', 'desc')
      );
    } else {
      q = query(collection(db, 'attendance'), orderBy('markedAt', 'desc'));
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const attendanceData: AttendanceRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        attendanceData.push({
          id: doc.id,
          ...data,
          eventDate: data.eventDate?.toDate ? data.eventDate.toDate() : new Date(data.eventDate || Date.now()),
          markedAt: data.markedAt?.toDate ? data.markedAt.toDate() : new Date(data.markedAt || Date.now())
        } as AttendanceRecord);
      });
      setAttendance(attendanceData);
      setLoading(false);
    });

    return unsubscribe;
  }, [eventId]);

  return { attendance, loading };
};
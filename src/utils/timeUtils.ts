export const isWithinTimeRange = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: 'Asia/Kolkata' 
  });
  
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const endMinutes = endHour * 60 + endMinute;
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export const getCurrentIST = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour12: true, 
    timeZone: 'Asia/Kolkata' 
  });
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getSessionStatus = (startTime: string, endTime: string) => {
  const isActive = isWithinTimeRange(startTime, endTime);
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: 'Asia/Kolkata' 
  });
  
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const endMinutes = endHour * 60 + endMinute;
  
  if (currentMinutes < startMinutes) {
    return { status: 'upcoming', message: 'Session hasn\'t started yet' };
  } else if (currentMinutes > endMinutes) {
    return { status: 'ended', message: 'Session has ended' };
  } else {
    return { status: 'active', message: 'Session is active' };
  }
};
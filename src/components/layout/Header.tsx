import { Shield, Clock } from 'lucide-react';
import { getCurrentIST } from '@/utils/timeUtils';
import { useState, useEffect } from 'react';

export const Header = () => {
  const [currentTime, setCurrentTime] = useState(getCurrentIST());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentIST());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-light rounded-lg">
            <Shield className="h-6 w-6 icon-blue" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">
              Brigade Attendance Portal
            </h1>
            <p className="text-xs text-gray-600 font-medium">Lead & Co-Lead Management System</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4 icon-blue" />
            <span className="font-mono text-sm font-medium text-gray-800">{currentTime} IST</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                admin@ignite.com
              </p>
              <p className="text-xs text-gray-500 font-medium">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
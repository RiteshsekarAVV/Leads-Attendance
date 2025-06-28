import { LogOut, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentIST } from '@/utils/timeUtils';
import { useState, useEffect } from 'react';

export const Header = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(getCurrentIST());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentIST());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header-enhanced sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 gradient-primary rounded-2xl shadow-xl hover-glow">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient-primary">
                Brigade Attendance Portal
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 font-semibold">Lead & Co-Lead Management System</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="hidden md:flex items-center space-x-2 glass px-4 py-3 rounded-xl shadow-lg">
            <div className="p-2 gradient-blue rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <span className="font-mono text-sm font-bold text-gray-800">{currentTime} IST</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block text-right glass px-4 py-2 rounded-xl">
              <p className="text-sm font-bold text-gray-900 truncate max-w-32 sm:max-w-none">
                {user?.email}
              </p>
              <p className="text-xs text-gray-600 font-semibold">Administrator</p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="btn-danger hover-lift border-2 font-semibold"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
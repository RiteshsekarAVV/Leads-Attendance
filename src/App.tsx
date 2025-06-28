import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { Dashboard } from '@/pages/Dashboard';
import { Events } from '@/pages/Events';
import { Users } from '@/pages/Users';
import { Attendance } from '@/pages/Attendance';
import { AttendanceRecords } from '@/pages/AttendanceRecords';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'events':
        return <Events />;
      case 'users':
        return <Users />;
      case 'attendance':
        return <Attendance />;
      case 'attendance-records':
        return <AttendanceRecords />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="w-full">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
}

export default App;
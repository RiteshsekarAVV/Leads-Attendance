import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { TopNavigation } from '@/components/layout/TopNavigation';
import { Dashboard } from '@/pages/Dashboard';
import { Events } from '@/pages/Events';
import { Users } from '@/pages/Users';
import { Attendance } from '@/pages/Attendance';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginForm />
        <Toaster />
      </>
    );
  }

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
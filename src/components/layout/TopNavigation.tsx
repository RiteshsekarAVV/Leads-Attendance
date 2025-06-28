import { Calendar, Users, BarChart3, CheckSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: BarChart3, 
    color: 'icon-blue',
    bgColor: 'bg-blue-light'
  },
  { 
    id: 'events', 
    name: 'Events', 
    icon: Calendar, 
    color: 'icon-green',
    bgColor: 'bg-green-light'
  },
  { 
    id: 'users', 
    name: 'Brigade Leads', 
    icon: Users, 
    color: 'icon-purple',
    bgColor: 'bg-purple-light'
  },
  { 
    id: 'attendance', 
    name: 'Mark Attendance', 
    icon: CheckSquare, 
    color: 'icon-orange',
    bgColor: 'bg-orange-light'
  }
];

export const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gray-100 text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <div className={cn("p-1.5 rounded-md", isActive ? item.bgColor : "bg-gray-100")}>
                  <Icon className={cn("h-4 w-4", isActive ? item.color : "text-gray-500")} />
                </div>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto space-x-1 pb-1 scrollbar-hide">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[80px]',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className={cn("p-1.5 rounded-md", isActive ? item.bgColor : "bg-gray-100")}>
                    <Icon className={cn("h-4 w-4", isActive ? item.color : "text-gray-500")} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.name.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
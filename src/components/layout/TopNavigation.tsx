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
    gradient: 'gradient-blue',
    textGradient: 'text-gradient-blue',
    bgGradient: 'from-blue-500/20 to-blue-600/20',
    iconBg: 'gradient-blue'
  },
  { 
    id: 'events', 
    name: 'Events', 
    icon: Calendar, 
    gradient: 'gradient-green',
    textGradient: 'text-gradient-green',
    bgGradient: 'from-green-500/20 to-green-600/20',
    iconBg: 'gradient-green'
  },
  { 
    id: 'users', 
    name: 'Brigade Leads', 
    icon: Users, 
    gradient: 'gradient-purple',
    textGradient: 'text-gradient-purple',
    bgGradient: 'from-purple-500/20 to-purple-600/20',
    iconBg: 'gradient-purple'
  },
  { 
    id: 'attendance', 
    name: 'Mark Attendance', 
    icon: CheckSquare, 
    gradient: 'gradient-orange',
    textGradient: 'text-gradient-orange',
    bgGradient: 'from-orange-500/20 to-orange-600/20',
    iconBg: 'gradient-orange'
  },
  { 
    id: 'create-event', 
    name: 'Create Event', 
    icon: Plus, 
    gradient: 'gradient-pink',
    textGradient: 'text-gradient-pink',
    bgGradient: 'from-pink-500/20 to-pink-600/20',
    iconBg: 'gradient-pink'
  },
];

export const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
  return (
    <nav className="header-enhanced sticky top-[88px] z-40 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center space-x-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex items-center space-x-3 px-6 py-4 rounded-2xl text-left transition-all duration-300 group relative overflow-hidden hover-lift font-bold',
                  isActive
                    ? `bg-gradient-to-r ${item.bgGradient} text-gray-900 shadow-2xl backdrop-blur-sm border-2 border-white/50`
                    : 'text-gray-600 hover:bg-white/20 hover:text-gray-900 hover:shadow-xl border-2 border-transparent hover:border-white/30'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon with gradient background */}
                <div className={cn(
                  "p-3 rounded-xl transition-all duration-300 shadow-lg",
                  isActive 
                    ? item.iconBg
                    : "bg-gray-200/50 group-hover:bg-gray-300/50"
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                
                <span className="text-sm font-bold">{item.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className={cn(
                    "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-t-full",
                    item.gradient
                  )} />
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'flex flex-col items-center space-y-2 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden hover-lift font-bold min-w-[100px]',
                    isActive
                      ? `bg-gradient-to-r ${item.bgGradient} text-gray-900 shadow-2xl backdrop-blur-sm border-2 border-white/50`
                      : 'text-gray-600 hover:bg-white/20 hover:text-gray-900 hover:shadow-xl border-2 border-transparent hover:border-white/30'
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Icon with gradient background */}
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-300 shadow-lg",
                    isActive 
                      ? item.iconBg
                      : "bg-gray-200/50 group-hover:bg-gray-300/50"
                  )}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <span className="text-xs font-bold text-center leading-tight">
                    {item.name.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className={cn(
                      "absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-full",
                      item.gradient
                    )} />
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
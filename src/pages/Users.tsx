import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from '@/components/users/UserList';
import { AddUserForm } from '@/components/users/AddUserForm';
import { BulkUpload } from '@/components/users/BulkUpload';
import { useUsersData } from '@/hooks/useFirestore';
import { Users as UsersIcon, UserPlus, Upload, List, Activity, TrendingUp } from 'lucide-react';

export const Users = () => {
  const { users, loading } = useUsersData();

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="card-enhanced rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
              <div className="p-4 sm:p-6 gradient-purple rounded-3xl shadow-2xl animate-float hover-glow">
                <UsersIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gradient-purple mb-3">
                  Brigade Leads Management
                </h1>
                <div className="w-40 sm:w-48 h-1.5 gradient-purple rounded-full mx-auto lg:mx-0"></div>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl leading-relaxed font-semibold mt-4">
                  Add, manage, and view all brigade leads and co-leads with comprehensive user management tools
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-purple rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-purple mb-1">
                  {users.length}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">Total Users</p>
              </div>
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-pink rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-pink mb-1">
                  {new Set(users.map(u => u.brigadeName)).size}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">Brigades</p>
              </div>
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-blue rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-blue mb-1">
                  {users.filter(u => u.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">This Week</p>
              </div>
              <div className="glass p-4 sm:p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-3 gradient-green rounded-2xl w-fit mx-auto mb-3 shadow-xl">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-green mb-1">
                  {Math.round((users.length / Math.max(users.length, 1)) * 100)}%
                </div>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">Active Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card-enhanced rounded-3xl shadow-2xl border-2 border-white/50 p-6 sm:p-8 animate-slide-in-left">
          <Tabs defaultValue="list" className="space-y-8 tabs-enhanced">
            <TabsList className="tabs-list grid w-full grid-cols-1 sm:grid-cols-3 p-2 rounded-2xl shadow-xl">
              <TabsTrigger 
                value="list" 
                className="tabs-trigger rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 p-3"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <span className="ml-1">({users.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="add"
                className="tabs-trigger rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 p-3"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Manually</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bulk"
                className="tabs-trigger rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 p-3"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Bulk Upload</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-8">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-8"></div>
                  <p className="text-gray-700 text-2xl font-bold">Loading users...</p>
                  <div className="flex justify-center space-x-2 mt-6">
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-pink-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              ) : (
                <UserList users={users} />
              )}
            </TabsContent>
            
            <TabsContent value="add" className="mt-8">
              <AddUserForm />
            </TabsContent>
            
            <TabsContent value="bulk" className="mt-8">
              <BulkUpload />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
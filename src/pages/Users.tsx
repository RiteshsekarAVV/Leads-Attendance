import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from '@/components/users/UserList';
import { AddUserForm } from '@/components/users/AddUserForm';
import { BulkUpload } from '@/components/users/BulkUpload';
import { BrigadeManagement } from '@/components/brigades/BrigadeManagement';
import { useUsersData } from '@/hooks/useFirestore';
import { Users as UsersIcon, UserPlus, Upload, List, Activity, TrendingUp, Building2 } from 'lucide-react';

export const Users = () => {
  const { users, loading } = useUsersData();

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-light rounded-lg">
              <UsersIcon className="h-6 w-6 icon-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Brigade Leads Management</h1>
              <p className="text-gray-600">Add, manage, and view all brigade leads and co-leads</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-light rounded-lg">
                  <UsersIcon className="h-5 w-5 icon-purple" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {users.length}
                  </div>
                  <p className="text-sm text-purple-700 font-medium">Total Users</p>
                </div>
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-light rounded-lg">
                  <Activity className="h-5 w-5 icon-pink" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-900">
                    {new Set(users.map(u => u.brigadeName)).size}
                  </div>
                  <p className="text-sm text-pink-700 font-medium">Brigades</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-light rounded-lg">
                  <TrendingUp className="h-5 w-5 icon-blue" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {users.filter(u => u.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">This Week</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-light rounded-lg">
                  <Activity className="h-5 w-5 icon-green" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {Math.round((users.length / Math.max(users.length, 1)) * 100)}%
                  </div>
                  <p className="text-sm text-green-700 font-medium">Active Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="list" 
                className="rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 py-2"
              >
                <div className="p-1 bg-gray-200 rounded-md">
                  <List className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <span className="ml-1">({users.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="add"
                className="rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 py-2"
              >
                <div className="p-1 bg-gray-200 rounded-md">
                  <UserPlus className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden sm:inline">Add Manually</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bulk"
                className="rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 py-2"
              >
                <div className="p-1 bg-gray-200 rounded-md">
                  <Upload className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden sm:inline">Bulk Upload</span>
                <span className="sm:hidden">Bulk</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brigades"
                className="rounded-md font-medium transition-all duration-200 flex items-center justify-center space-x-2 py-2"
              >
                <div className="p-1 bg-gray-200 rounded-md">
                  <Building2 className="h-4 w-4 text-gray-600" />
                </div>
                <span className="hidden sm:inline">Brigades</span>
                <span className="sm:hidden">Brigades</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg font-medium">Loading users...</p>
                </div>
              ) : (
                <UserList users={users} />
              )}
            </TabsContent>
            
            <TabsContent value="add">
              <AddUserForm />
            </TabsContent>
            
            <TabsContent value="bulk">
              <BulkUpload />
            </TabsContent>
            
            <TabsContent value="brigades">
              <BrigadeManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
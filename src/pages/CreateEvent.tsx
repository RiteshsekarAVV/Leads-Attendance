import { CreateEventModal } from '@/components/events/CreateEventModal';
import { Plus, Calendar, Clock, Users } from 'lucide-react';

export const CreateEvent = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Event
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Set up a new multi-day event with customizable FN and AN sessions for comprehensive attendance tracking
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Multi-day Setup</h3>
                <p className="text-sm text-gray-600">Configure events spanning multiple days</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Custom Timings</h3>
                <p className="text-sm text-gray-600">Set unique FN and AN session times per day</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Session Control</h3>
                <p className="text-sm text-gray-600">Enable/disable sessions per day as needed</p>
              </div>
            </div>
            
            <div className="mt-8">
              <CreateEventModal />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
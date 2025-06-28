import { CreateEventForm } from '@/components/events/CreateEventForm';
import { Plus, Calendar, Clock, Users, Target, Activity } from 'lucide-react';

export const CreateEvent = () => {
  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="card-enhanced rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
              <div className="p-4 sm:p-6 gradient-pink rounded-3xl shadow-2xl animate-float hover-glow">
                <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gradient-pink mb-3">
                  Create New Event
                </h1>
                <div className="w-32 sm:w-40 h-1.5 gradient-pink rounded-full mx-auto lg:mx-0"></div>
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-3xl leading-relaxed font-semibold mt-4">
                  Set up a new event with FN and AN sessions for comprehensive attendance tracking and management
                </p>
              </div>
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="glass p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-4 gradient-blue rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-gray-800 mb-3 text-lg">Event Setup</h3>
                <p className="text-sm text-gray-600 font-semibold">Configure event details and date</p>
              </div>
              <div className="glass p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-4 gradient-purple rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-gray-800 mb-3 text-lg">Session Times</h3>
                <p className="text-sm text-gray-600 font-semibold">Set FN and AN session timings</p>
              </div>
              <div className="glass p-6 rounded-2xl text-center hover-lift border-2 border-white/40">
                <div className="p-4 gradient-green rounded-2xl w-fit mx-auto mb-4 shadow-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-gray-800 mb-3 text-lg">Attendance Ready</h3>
                <p className="text-sm text-gray-600 font-semibold">Ready for brigade lead tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="animate-slide-in-left">
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
};
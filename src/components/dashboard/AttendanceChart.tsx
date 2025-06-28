import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface AttendanceChartProps {
  sessionData: {
    name: string;
    fn: number;
    an: number;
  }[];
  brigadeData: {
    name: string;
    attendance: number;
    color: string;
  }[];
}

export const AttendanceChart = ({ sessionData, brigadeData }: AttendanceChartProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="card-enhanced shadow-2xl border-2 border-white/50 hover-lift">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 gradient-blue rounded-2xl shadow-xl hover-glow">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-gradient-blue">
                Session-wise Attendance
              </CardTitle>
              <CardDescription className="text-gray-700 font-semibold">
                Comparison between FN and AN session attendance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                axisLine={{ stroke: '#9ca3af' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                axisLine={{ stroke: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(20px)',
                  fontWeight: 600
                }}
              />
              <Bar 
                dataKey="fn" 
                fill="url(#fnGradient)" 
                name="FN Session" 
                radius={[8, 8, 0, 0]}
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <Bar 
                dataKey="an" 
                fill="url(#anGradient)" 
                name="AN Session" 
                radius={[8, 8, 0, 0]}
                stroke="#10B981"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="fnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                <linearGradient id="anGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-enhanced shadow-2xl border-2 border-white/50 hover-lift">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 gradient-purple rounded-2xl shadow-xl hover-glow">
              <PieChartIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-gradient-purple">
                Brigade-wise Performance
              </CardTitle>
              <CardDescription className="text-gray-700 font-semibold">
                Attendance distribution across brigades
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brigadeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="attendance"
                stroke="#fff"
                strokeWidth={4}
              >
                {brigadeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  backdropFilter: 'blur(20px)',
                  fontWeight: 600
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
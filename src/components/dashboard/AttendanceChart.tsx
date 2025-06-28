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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-compact hover-lift">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-light rounded-lg">
              <BarChart3 className="h-5 w-5 icon-blue" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">
                Session-wise Attendance
              </CardTitle>
              <CardDescription className="text-gray-600">
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
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                axisLine={{ stroke: '#9ca3af' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                axisLine={{ stroke: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontWeight: 500
                }}
              />
              <Bar 
                dataKey="fn" 
                fill="#3b82f6" 
                name="FN Session" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="an" 
                fill="#10b981" 
                name="AN Session" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-compact hover-lift">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-light rounded-lg">
              <PieChartIcon className="h-5 w-5 icon-purple" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">
                Brigade-wise Performance
              </CardTitle>
              <CardDescription className="text-gray-600">
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
                strokeWidth={2}
              >
                {brigadeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontWeight: 500
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
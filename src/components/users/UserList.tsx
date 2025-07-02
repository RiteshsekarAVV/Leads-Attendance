import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Trash2, Download } from 'lucide-react';
import { User } from '@/types';
import { format } from 'date-fns';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';
import { exportUserListByDepartment } from '@/utils/excelUtils';

interface UserListProps {
  users: User[];
}

export const UserList = ({ users }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { deleteUser, loading } = useFirestore();

  const filteredUsers = users.filter(user =>
    (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.brigadeName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const result = await deleteUser(userId);
      if (result.success) {
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleExportUsers = () => {
    exportUserListByDepartment(users, 'brigade_leads_by_department');
    toast.success('User list exported successfully with department-wise sheets');
  };

  const brigadeColors: { [key: string]: string } = {
    'Tech Brigade': 'bg-blue-100 text-blue-800',
    'Media Brigade': 'bg-green-100 text-green-800',
    'Design Brigade': 'bg-purple-100 text-purple-800',
    'Management Brigade': 'bg-orange-100 text-orange-800',
    'Sports Brigade': 'bg-red-100 text-red-800',
  };

  const getBrigadeColor = (brigadeName: string) => {
    return brigadeColors[brigadeName] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get department code from roll number for display
  const getDepartmentCode = (rollNumber: string): string => {
    if (!rollNumber || rollNumber.length < 5) {
      return 'UNKNOWN';
    }
    
    if (rollNumber.charAt(2) !== 'B') {
      return 'UNKNOWN';
    }
    
    const deptCode = rollNumber.substring(2, 5);
    
    if (deptCode === 'BCW' || deptCode === 'TCW') {
      return 'CW';
    }
    
    return deptCode;
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Brigade Leads Found</h3>
          <p className="text-gray-500">Add brigade leads and co-leads to start tracking attendance.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Brigade Leads & Co-Leads ({users.length})</span>
            </CardTitle>
            <CardDescription>
              Manage registered brigade leads and co-leads (Export creates department-wise sheets)
            </CardDescription>
          </div>
          <Button onClick={handleExportUsers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export by Department
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, roll number, email, or brigade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Brigade</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.rollNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getDepartmentCode(user.rollNumber)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getBrigadeColor(user.brigadeName)}>
                        {user.brigadeName}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(user.createdAt, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
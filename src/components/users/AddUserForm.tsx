import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { useFirestore, useBrigadesData } from '@/hooks/useFirestore';
import { toast } from 'sonner';

export const AddUserForm = () => {
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [brigadeName, setBrigadeName] = useState('');
  
  const { addUser, loading } = useFirestore();
  const { brigades } = useBrigadesData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !rollNumber || !email || !brigadeName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const userData = {
      fullName,
      rollNumber,
      email,
      brigadeName
    };

    const result = await addUser(userData);
    
    if (result.success) {
      toast.success('Brigade lead added successfully!');
      // Reset form
      setFullName('');
      setRollNumber('');
      setEmail('');
      setBrigadeName('');
    } else {
      toast.error(result.error || 'Failed to add user');
    }
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md shadow-sm border border-gray-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-purple-light rounded-lg">
              <UserPlus className="h-6 w-6 icon-purple" />
            </div>
          </div>
          <CardTitle className="text-xl text-gray-900">Add Brigade Lead</CardTitle>
          <CardDescription>
            Manually add a new brigade lead or co-lead
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-sm font-medium text-gray-700">
                Roll Number *
              </Label>
              <Input
                id="rollNumber"
                placeholder="e.g., CS001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brigadeName" className="text-sm font-medium text-gray-700">
                Brigade Name *
              </Label>
              <Select value={brigadeName} onValueChange={setBrigadeName}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a brigade" />
                </SelectTrigger>
                <SelectContent>
                  {brigades
                    .filter(brigade => brigade.isActive)
                    .map((brigade) => (
                      <SelectItem key={brigade.id} value={brigade.name}>
                        {brigade.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {brigades.length === 0 && (
                <p className="text-xs text-amber-600">
                  No brigades available. Create a brigade first in the Brigades tab.
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white font-medium" 
              disabled={loading || brigades.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding User...
                </>
              ) : (
                'Add Brigade Lead'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
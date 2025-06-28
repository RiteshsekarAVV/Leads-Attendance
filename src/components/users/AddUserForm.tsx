import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';

const brigades = [
  'Tech Brigade',
  'Media Brigade',
  'Design Brigade',
  'Management Brigade',
  'Sports Brigade',
];

export const AddUserForm = () => {
  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [brigadeName, setBrigadeName] = useState('');
  
  const { addUser, loading } = useFirestore();

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
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Add Brigade Lead</span>
        </CardTitle>
        <CardDescription>
          Manually add a new brigade lead or co-lead
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rollNumber">Roll Number *</Label>
            <Input
              id="rollNumber"
              placeholder="e.g., CS001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brigade">Brigade Name *</Label>
            <Select value={brigadeName} onValueChange={setBrigadeName}>
              <SelectTrigger>
                <SelectValue placeholder="Select a brigade" />
              </SelectTrigger>
              <SelectContent>
                {brigades.map((brigade) => (
                  <SelectItem key={brigade} value={brigade}>
                    {brigade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
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
  );
};
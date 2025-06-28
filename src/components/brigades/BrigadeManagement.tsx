import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Trash2, Building2 } from 'lucide-react';
import { useFirestore, useBrigadesData } from '@/hooks/useFirestore';
import { toast } from 'sonner';

export const BrigadeManagement = () => {
  const [brigadeName, setBrigadeName] = useState('');
  const [brigadeDescription, setBrigadeDescription] = useState('');
  
  const { addBrigade, deleteBrigade, loading } = useFirestore();
  const { brigades, loading: brigadesLoading } = useBrigadesData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brigadeName.trim()) {
      toast.error('Please enter a brigade name');
      return;
    }

    // Check if brigade already exists
    const existingBrigade = brigades.find(b => 
      b.name.toLowerCase() === brigadeName.trim().toLowerCase()
    );
    
    if (existingBrigade) {
      toast.error('Brigade with this name already exists');
      return;
    }

    const brigadeData = {
      name: brigadeName.trim(),
      description: brigadeDescription.trim() || '',
      isActive: true
    };

    const result = await addBrigade(brigadeData);
    
    if (result.success) {
      toast.success('Brigade created successfully!');
      setBrigadeName('');
      setBrigadeDescription('');
    } else {
      toast.error(result.error || 'Failed to create brigade');
    }
  };

  const handleDeleteBrigade = async (brigadeId: string, brigadeName: string) => {
    if (confirm(`Are you sure you want to delete "${brigadeName}" brigade? This action cannot be undone.`)) {
      const result = await deleteBrigade(brigadeId);
      if (result.success) {
        toast.success('Brigade deleted successfully');
      } else {
        toast.error('Failed to delete brigade');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Brigade Form */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">Create New Brigade</CardTitle>
              <CardDescription>
                Add a new brigade to organize your leads and co-leads
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brigadeName" className="text-sm font-medium text-gray-700">
                  Brigade Name *
                </Label>
                <Input
                  id="brigadeName"
                  placeholder="e.g., Tech Brigade"
                  value={brigadeName}
                  onChange={(e) => setBrigadeName(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brigadeDescription" className="text-sm font-medium text-gray-700">
                  Description (Optional)
                </Label>
                <Input
                  id="brigadeDescription"
                  placeholder="Brief description of the brigade"
                  value={brigadeDescription}
                  onChange={(e) => setBrigadeDescription(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Brigade
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Brigades List */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">
                Existing Brigades ({brigades.length})
              </CardTitle>
              <CardDescription>
                Manage all created brigades
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {brigadesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading brigades...</p>
            </div>
          ) : brigades.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Brigades Found</h3>
              <p className="text-gray-500">Create your first brigade to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brigade Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brigades.map((brigade) => (
                    <TableRow key={brigade.id}>
                      <TableCell className="font-medium">{brigade.name}</TableCell>
                      <TableCell className="text-gray-600">
                        {brigade.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            brigade.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {brigade.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {brigade.createdAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteBrigade(brigade.id, brigade.name)}
                          disabled={loading}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
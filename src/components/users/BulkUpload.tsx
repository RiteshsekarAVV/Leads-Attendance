import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { parseExcelFile, downloadTemplate, ExcelUser } from '@/utils/excelUtils';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from 'sonner';

export const BulkUpload = () => {
  const [previewData, setPreviewData] = useState<ExcelUser[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addUsersBulk, loading } = useFirestore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    try {
      const data = await parseExcelFile(file);
      setPreviewData(data);
      toast.success(`Parsed ${data.length} records from Excel file`);
    } catch (error: any) {
      toast.error(error.message);
    }
    setUploading(false);
  };

  const handleConfirmUpload = async () => {
    if (previewData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    const result = await addUsersBulk(previewData);
    
    if (result.success) {
      toast.success(`Successfully added ${previewData.length} brigade leads!`);
      setPreviewData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      toast.error(result.error || 'Failed to upload users');
    }
  };

  const handleClearPreview = () => {
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Bulk Upload Brigade Leads</span>
          </CardTitle>
          <CardDescription>
            Upload multiple brigade leads and co-leads using an Excel file
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>
            
            <div className="text-sm text-gray-500">
              Download the template first, fill it with data, then upload
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Upload Excel File</p>
              <p className="text-sm text-gray-500">
                Select an Excel file (.xlsx or .xls) with brigade lead data
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview Data ({previewData.length} records)</CardTitle>
                <CardDescription>
                  Review the data before confirming the upload
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleClearPreview}>
                  Clear
                </Button>
                <Button onClick={handleConfirmUpload} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Confirm Upload'
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Brigade Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 10).map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.rollNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.brigadeName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {previewData.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Showing first 10 records. Total: {previewData.length} records
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
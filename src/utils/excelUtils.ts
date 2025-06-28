import * as XLSX from 'xlsx';
import { User } from '@/types';

export interface ExcelUser {
  fullName: string;
  rollNumber: string;
  email: string;
  brigadeName: string;
}

export const parseExcelFile = (file: File): Promise<ExcelUser[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Skip header row and process data
        const users: ExcelUser[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length >= 4 && row[0] && row[1] && row[2] && row[3]) {
            users.push({
              fullName: String(row[0]).trim(),
              rollNumber: String(row[1]).trim(),
              email: String(row[2]).trim(),
              brigadeName: String(row[3]).trim()
            });
          }
        }
        
        resolve(users);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const downloadTemplate = () => {
  const template = [
    ['Full Name', 'Roll Number', 'Email', 'Brigade Name'],
    ['John Doe', 'CS001', 'john.doe@example.com', 'Tech Brigade'],
    ['Jane Smith', 'CS002', 'jane.smith@example.com', 'Media Brigade']
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Brigade Leads Template');
  
  XLSX.writeFile(wb, 'brigade_leads_template.xlsx');
};

export const exportAttendanceData = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance Data');
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
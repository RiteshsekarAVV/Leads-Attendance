import * as XLSX from 'xlsx';

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
    ['John Doe', '25BBA001', 'john.doe@example.com', 'Tech Brigade'],
    ['Jane Smith', '25BCA002', 'jane.smith@example.com', 'Media Brigade'],
    ['Mike Johnson', '25BCW003', 'mike.johnson@example.com', 'Design Brigade'],
    ['Sarah Wilson', '25TCW004', 'sarah.wilson@example.com', 'Management Brigade']
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Brigade Leads Template');
  
  XLSX.writeFile(wb, 'brigade_leads_template.xlsx');
};

// Helper function to extract department code from roll number
const getDepartmentCode = (rollNumber: string): string => {
  if (!rollNumber || rollNumber.length < 5) {
    return 'UNKNOWN';
  }
  
  // Check if third character is 'B' (indicating it's a valid format like 25BBA001)
  if (rollNumber.charAt(2) !== 'B') {
    return 'UNKNOWN';
  }
  
  // Extract the department code (characters 2-4, e.g., "BBA" from "25BBA001")
  const deptCode = rollNumber.substring(2, 5);
  
  // Special case: BCW or TCW should go to CW sheet
  if (deptCode === 'BCW' || deptCode === 'TCW') {
    return 'CW';
  }
  
  return deptCode;
};

export const exportAttendanceData = (data: any[], filename: string) => {
  // Group data by department code
  const departmentGroups = new Map<string, any[]>();
  
  data.forEach(record => {
    const rollNumber = record['Roll Number'] || '';
    const deptCode = getDepartmentCode(rollNumber);
    
    if (!departmentGroups.has(deptCode)) {
      departmentGroups.set(deptCode, []);
    }
    departmentGroups.get(deptCode)!.push(record);
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Sort department codes for consistent ordering
  const sortedDeptCodes = Array.from(departmentGroups.keys()).sort();
  
  // Create a sheet for each department
  sortedDeptCodes.forEach(deptCode => {
    const deptData = departmentGroups.get(deptCode)!;
    const ws = XLSX.utils.json_to_sheet(deptData);
    
    // Use department code as sheet name, with fallback for unknown
    const sheetName = deptCode === 'UNKNOWN' ? 'Others' : deptCode;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });
  
  // If no valid departments found, create a single sheet with all data
  if (departmentGroups.size === 0 || (departmentGroups.size === 1 && departmentGroups.has('UNKNOWN'))) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'All Data');
  }
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// New function specifically for exporting user lists with department sheets
export const exportUserListByDepartment = (users: any[], filename: string) => {
  // Group users by department code
  const departmentGroups = new Map<string, any[]>();
  
  users.forEach(user => {
    const rollNumber = user.rollNumber || user['Roll Number'] || '';
    const deptCode = getDepartmentCode(rollNumber);
    
    if (!departmentGroups.has(deptCode)) {
      departmentGroups.set(deptCode, []);
    }
    departmentGroups.get(deptCode)!.push({
      'Full Name': user.fullName || user['Full Name'],
      'Roll Number': user.rollNumber || user['Roll Number'],
      'Email': user.email || user['Email'],
      'Brigade Name': user.brigadeName || user['Brigade Name'],
      'Created At': user.createdAt ? 
        (user.createdAt instanceof Date ? 
          user.createdAt.toISOString().split('T')[0] : 
          user.createdAt) : 
        (user['Created At'] || 'N/A')
    });
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Sort department codes for consistent ordering
  const sortedDeptCodes = Array.from(departmentGroups.keys()).sort();
  
  // Create a sheet for each department
  sortedDeptCodes.forEach(deptCode => {
    const deptData = departmentGroups.get(deptCode)!;
    const ws = XLSX.utils.json_to_sheet(deptData);
    
    // Use department code as sheet name, with fallback for unknown
    const sheetName = deptCode === 'UNKNOWN' ? 'Others' : deptCode;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });
  
  // If no valid departments found, create a single sheet with all data
  if (departmentGroups.size === 0 || (departmentGroups.size === 1 && departmentGroups.has('UNKNOWN'))) {
    const userData = users.map(user => ({
      'Full Name': user.fullName || user['Full Name'],
      'Roll Number': user.rollNumber || user['Roll Number'],
      'Email': user.email || user['Email'],
      'Brigade Name': user.brigadeName || user['Brigade Name'],
      'Created At': user.createdAt ? 
        (user.createdAt instanceof Date ? 
          user.createdAt.toISOString().split('T')[0] : 
          user.createdAt) : 
        'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(wb, ws, 'All Users');
  }
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
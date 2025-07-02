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

  // Special case: BCW or TCW should go to CW sheet
  if (deptCode === 'BCW' || deptCode === 'TCW') {
    return 'CW';
  }
  
  // Check if third character is 'B' (indicating it's a valid format like 25BBA001)
  if (rollNumber.charAt(2) !== 'B') {
    return 'UNKNOWN';
  }
  
  // Extract the department code (characters 2-4, e.g., "BBA" from "25BBA001")
  const deptCode = rollNumber.substring(2, 5);
  
  return deptCode;
};

// Helper function to format date as "Jul 2, 2025"
const formatDateForExcel = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to format datetime as "Jul 2, 08:58"
const formatDateTimeForExcel = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }) + ', ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const exportAttendanceData = (data: any[], filename: string, eventName?: string) => {
  // Prepare data with updated format
  const formattedData = data.map(record => ({
    'Date': formatDateForExcel(new Date(record['Date'])),
    'Full Name': record['Full Name'],
    'Roll Number': record['Roll Number'],
    'Brigade': record['Brigade'],
    'Status': record['Status'],
    'Marked At': record['Marked At'] !== 'N/A' ? 
      formatDateTimeForExcel(new Date(record['Marked At'])) : 'N/A',
    'Marked By': record['Marked By']
  }));

  // Group data by department code
  const departmentGroups = new Map<string, any[]>();
  
  formattedData.forEach(record => {
    const rollNumber = record['Roll Number'] || '';
    const deptCode = getDepartmentCode(rollNumber);
    
    if (!departmentGroups.has(deptCode)) {
      departmentGroups.set(deptCode, []);
    }
    departmentGroups.get(deptCode)!.push(record);
  });
  
  // Sort data within each department by Roll Number
  departmentGroups.forEach((records, deptCode) => {
    records.sort((a, b) => {
      const rollA = a['Roll Number'] || '';
      const rollB = b['Roll Number'] || '';
      return rollA.localeCompare(rollB);
    });
  });
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add Overall Data sheet first (sorted by Roll Number)
  const sortedOverallData = [...formattedData].sort((a, b) => {
    const rollA = a['Roll Number'] || '';
    const rollB = b['Roll Number'] || '';
    return rollA.localeCompare(rollB);
  });
  const overallWs = XLSX.utils.json_to_sheet(sortedOverallData);
  XLSX.utils.book_append_sheet(wb, overallWs, 'Overall Data');
  
  // Create stats data (without attendance percentage)
  const statsData = createStatsData(formattedData);
  const statsWs = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, statsWs, 'Stats');
  
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
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Function to create stats data (without attendance percentage)
const createStatsData = (data: any[]) => {
  const brigadeStats = new Map<string, {
    total: number;
    present: number;
    absent: number;
    notMarked: number;
  }>();

  // Initialize brigade stats
  data.forEach(record => {
    const brigade = record['Brigade'];
    if (!brigadeStats.has(brigade)) {
      brigadeStats.set(brigade, {
        total: 0,
        present: 0,
        absent: 0,
        notMarked: 0
      });
    }
    
    const stats = brigadeStats.get(brigade)!;
    stats.total++;
    
    switch (record['Status']) {
      case 'Present':
        stats.present++;
        break;
      case 'Absent':
        stats.absent++;
        break;
      case 'Not Marked':
        stats.notMarked++;
        break;
    }
  });

  // Convert to array format for Excel (without attendance percentage)
  const statsArray = Array.from(brigadeStats.entries()).map(([brigade, stats]) => ({
    'Brigade': brigade,
    'Total Count': stats.total,
    'Present': stats.present,
    'Absent': stats.absent,
    'Not Marked': stats.notMarked
  }));

  return statsArray;
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
  
  // Sort data within each department by Roll Number
  departmentGroups.forEach((records, deptCode) => {
    records.sort((a, b) => {
      const rollA = a['Roll Number'] || '';
      const rollB = b['Roll Number'] || '';
      return rollA.localeCompare(rollB);
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
    })).sort((a, b) => {
      const rollA = a['Roll Number'] || '';
      const rollB = b['Roll Number'] || '';
      return rollA.localeCompare(rollB);
    });
    const ws = XLSX.utils.json_to_sheet(userData);
    XLSX.utils.book_append_sheet(wb, ws, 'All Users');
  }
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
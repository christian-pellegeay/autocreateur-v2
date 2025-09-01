/**
 * File processing utilities for Autocreateur
 */
import * as XLSX from 'xlsx';

/**
 * Process and validate YouTube video XLSX file
 * @param file The XLSX file to process
 * @returns Processed video data
 */
export const processVideoFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        let jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process the data to ensure it has the required columns
        // We expect: URL, Duration, Title
        const processedData = jsonData.map((row: any) => {
          // Extract the needed columns - column names might vary
          // This is a simplification - in a real app we'd have more robust mapping
          const url = row.URL || row.url || row['Video URL'] || Object.values(row)[0];
          const duration = row.Duration || row.duration || row['Video Duration'] || Object.values(row)[1];
          const title = row.Title || row.title || row['Video Title'] || Object.values(row)[2];
          
          return { url, duration, title };
        });
        
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Save processed video data to XLSX file
 * @param data The video data to save
 * @returns Blob for download
 */
export const saveVideoDataToXLSX = (data: any[]): Blob => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Videos');
  
  // Generate XLSX file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob for download
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

/**
 * Mock function for DOCX concatenation
 * In a real implementation, we would use a proper DOCX processing library
 */
export const concatenateDocxFiles = async (file1: File, file2: File): Promise<Blob> => {
  // This is a mock implementation
  // In a real app, we would use a library like docx-merger or similar
  
  return new Promise((resolve) => {
    // For demo purposes, we'll just create a placeholder file
    const placeholderContent = new Blob(
      [`Combined content of ${file1.name} and ${file2.name}`], 
      { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );
    
    resolve(placeholderContent);
  });
};
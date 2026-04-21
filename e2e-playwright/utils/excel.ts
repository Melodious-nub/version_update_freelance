import * as XLSX from 'xlsx';
import * as fs from 'fs';

export function extractExcelDataToJson(excelFilePath: string, jsonOutputPath: string) {
  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);
  // Get the first sheet name
  const sheetName = workbook.SheetNames[0];
  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];
  // Convert to JSON, skipping the first row (header)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    defval: '', 
    range: 1 // Skip the first row (0-indexed, so 1 means start from row 2)
  });

  // Write JSON to file
  fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`Excel data extracted to ${jsonOutputPath}`);
}

export function extractAllSheetsToJson(excelFilePath: string, jsonOutputPath: string) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const allSheetsData: { [key: string]: any[] } = {};

    // Process each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON, skipping the first row (header)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', 
        range: 1 // Skip the first row (0-indexed, so 1 means start from row 2)
      });
      // Convert JSON data to string format
      // This is useful if you want to store the data as strings in the output JSON
      const jsonDataStr = convertJsonDataToString(jsonData);
      // Store data with sheet name as key
      //allSheetsData[sheetName] = jsonData;
      allSheetsData[sheetName] = jsonDataStr;
      console.log(`Sheet '${sheetName}' contains ${jsonData.length} rows of data`);
    });

    

    // Write JSON to file
    fs.writeFileSync(jsonOutputPath, JSON.stringify(allSheetsData, null, 2), 'utf-8');
    console.log(`All sheets data extracted to ${jsonOutputPath}`);
    console.log(`Total sheets processed: ${workbook.SheetNames.length}`);
    
    return allSheetsData;
  } catch (error) {
    console.error(`Error processing Excel file: ${error}`);
    throw error;
  }
}

export function extractAllSheetsToSeparateFiles(excelFilePath: string, outputDir: string) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const extractedFiles: string[] = [];

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process each sheet
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON, skipping the first row (header)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', 
        range: 1 // Skip the first row (0-indexed, so 1 means start from row 2)
      });

      // Create filename based on sheet name
      const sanitizedSheetName = sheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const outputPath = `${outputDir}/${sanitizedSheetName}.json`;
      
      // Write JSON to file
      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
      extractedFiles.push(outputPath);
      
      console.log(`Sheet '${sheetName}' data saved to ${outputPath} (${jsonData.length} rows)`);
    });

    console.log(`All sheets processed. Files created: ${extractedFiles.length}`);
    return extractedFiles;
  } catch (error) {
    console.error(`Error processing Excel file: ${error}`);
    throw error;
  }
}

export function extractSpecificSheets(excelFilePath: string, jsonOutputPath: string, sheetNames: string[]) {
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const selectedSheetsData: { [key: string]: any[] } = {};

    // Process only specified sheets
    sheetNames.forEach(sheetName => {
      if (workbook.SheetNames.includes(sheetName)) {
        console.log(`Processing sheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, skipping the first row (header)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '', 
          range: 1 // Skip the first row (0-indexed, so 1 means start from row 2)
        });

        selectedSheetsData[sheetName] = jsonData;
        console.log(`Sheet '${sheetName}' contains ${jsonData.length} rows of data`);
      } else {
        console.warn(`Sheet '${sheetName}' not found in the Excel file`);
      }
    });

    // Write JSON to file
    fs.writeFileSync(jsonOutputPath, JSON.stringify(selectedSheetsData, null, 2), 'utf-8');
    console.log(`Selected sheets data extracted to ${jsonOutputPath}`);
    
    return selectedSheetsData;
  } catch (error) {
    console.error(`Error processing Excel file: ${error}`);
    throw error;
  }
}

export function getExcelSheetInfo(excelFilePath: string) {
  try {
    const workbook = XLSX.readFile(excelFilePath);
    const sheetInfo: { [key: string]: { name: string; rowCount: number; colCount: number } } = {};

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
      
      sheetInfo[sheetName] = {
        name: sheetName,
        rowCount: range.e.r + 1, // +1 because it's 0-indexed
        colCount: range.e.c + 1  // +1 because it's 0-indexed
      };
    });

    console.log('Excel file sheet information:', sheetInfo);
    return sheetInfo;
  } catch (error) {
    console.error(`Error reading Excel file info: ${error}`);
    throw error;
  }
}

export function convertJsonDataToString(jsonData: any[]): { [key: string]: string }[] {
  return jsonData.map(row => {
    const stringRow: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = String(value);
    }
    return stringRow;
  });
}
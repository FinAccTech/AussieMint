// src/app/services/excel-export.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';

 import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root',
})

export class ExcelExportService {
//   exportAsExcelFile(data: any[], fileName: string, headers: string[]): void {
    
//     const replacedHeaders = headers.map(caption=> caption.replace("_"," "));
        
//     // Create a worksheet from the data array
//     const datawithHeaders = [replacedHeaders, ...data];
    
//    console.log(datawithHeaders);
    
// //   const newdata = [
// //   ["Sno", "Name", "Amount"],   // header row
// //   [1, "John", 100],
// //   [2, "Mary", 200],
// // ];

//     const worksheet = XLSX.utils.json_to_sheet(datawithHeaders);

//     headers.forEach((_, colIndex) => {
//     const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
//     const cell = worksheet[cellRef];

//     if (cell && !cell.s) {
//       cell.s = {}; // ensure style object exists
//     }

//     // Apply bold font
//     if (cell) {
//       cell.s = {
//         font: {
//           bold: true
//         }
//       };
//     }
//   });

//   // Step 3: Create workbook and write file
// const workbook: XLSX.WorkBook = {
//   Sheets: { Sheet1: worksheet },
//   SheetNames: ['Sheet1']
// };

// const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', cellStyles: true });
// const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
// FileSaver.saveAs(blob, `${fileName}.xlsx`);
    
//     // // Create a new workbook and append the worksheet
//     // const workbook = XLSX.utils.book_new();
//     // XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
//     // // Generate buffer
//     // const excelBuffer: any = XLSX.write(workbook, {
//     //   bookType: 'xlsx',
//     //   type: 'array',
//     // });
    
//     // // Create a Blob from the buffer and trigger the download
//     // const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
//     // saveAs(blob, `${fileName}.xlsx`);
//   }

// exportAsExcelFile(
//   objectData: any[],
//   fileName: string,
//   selectedColumns: string[],
//   totalColumns: string[]
// ): void {

//    const data = this.convertToObjects(objectData, selectedColumns);
  
//   // Step 1: Header row (prettified captions)
//   const headerRow = selectedColumns.map(caption => caption.replace("_", " "));

//   // Step 2: Data rows -> pick only selected columns
//   const dataRows = data.map(row =>
//     selectedColumns.map(col => row[col]) // extract values
//   );

//   // Step 3: Totals row -> only for specified totalColumns
//   const totalsRow: any[] = selectedColumns.map(col =>
//     totalColumns.includes(col)
//       ? data.reduce((sum, row) => sum + (Number(row[col]) || 0), 0)
//       : ""
//   );

//   // Add "Total" label in first cell if at least one total exists
//   if (totalsRow.some(v => v !== "")) {
//     totalsRow[0] = "Total";
//   }

//   // Step 4: Combine into final matrix
//   const worksheetData = [headerRow, ...dataRows, totalsRow];

//   // Step 5: Create worksheet from AOA
//   const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

//   // Step 6: Style header row
//   selectedColumns.forEach((_, colIndex) => {
//     const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
//     const cell = worksheet[cellRef];
//     if (cell) {
//       cell.s = { font: { bold: true } };
//     }
//   });

//   // Step 7: Style totals row
//   selectedColumns.forEach((_, colIndex) => {
//     const cellRef = XLSX.utils.encode_cell({ r: worksheetData.length - 1, c: colIndex });
//     const cell = worksheet[cellRef];
//     if (cell) {
//       cell.s = {
//         font: { bold: true },
//         fill: { fgColor: { rgb: "FFF2CC" } } // yellow background
//       };
//     }
//   });

//   // Step 8: Create workbook & export
//   const workbook: XLSX.WorkBook = {
//     Sheets: { Sheet1: worksheet },
//     SheetNames: ["Sheet1"]
//   };

//   const excelBuffer: any = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
//   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
//   FileSaver.saveAs(blob, `${fileName}.xlsx`);
// }


exportAsExcelFile(
  data: any[],
  fileName: string,  
  selectedColumns: string[],
  totalColumns: string[]
): void {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const allHeaders: string[] = selectedColumns;

  let objectData: any[];

  // --- Detect data type: objects vs arrays
  if (typeof data[0] === "object" && !Array.isArray(data[0])) {
    // ✅ Case 1: Array of objects
    objectData = data.map(row => {
      const obj: any = {};
      allHeaders.forEach(key => {
        const value = row[key];
        obj[key] = totalColumns.includes(key) ? Number(value) || 0 : value;
      });
      return obj;
    });
  } else {
    // ✅ Case 2: Array of arrays
    objectData = data.map(row => {
      const obj: any = {};
      allHeaders.forEach((key, idx) => {
        const value = row[idx];
        obj[key] = totalColumns.includes(key) ? Number(value) || 0 : value;
      });
      return obj;
    });
  }

  // --- Add totals row
  const totalsRow: any = {};
  selectedColumns.forEach((col, colIndex) => {
    if (totalColumns.includes(col)) {
      const colLetter = XLSX.utils.encode_col(colIndex);
      const startRow = 2; // Excel rows are 1-based
      const endRow = objectData.length + 1;
      totalsRow[col] = { f: `SUM(${colLetter}${startRow}:${colLetter}${endRow})` };
    } else {
      totalsRow[col] = "";
    }
  });
  totalsRow[selectedColumns[0]] = "Total";
  objectData.push(totalsRow);

  // --- Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(objectData, { header: selectedColumns });

  // === Styling ===
  const lastRowIndex = objectData.length; // includes totals row
  selectedColumns.forEach((_, colIndex) => {
    // Style totals row
    const cellRef = XLSX.utils.encode_cell({ r: lastRowIndex, c: colIndex });
    const cell = worksheet[cellRef];
    if (cell) {
      cell.s = {
        font: { bold: true, sz: 14 },
        fill: { fgColor: { rgb: "FFF2CC" } } // light yellow
      };
    }

    // Style header row
    const headerRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    const headerCell = worksheet[headerRef];
    if (headerCell) {
      headerCell.s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "FFD966" } } // darker yellow
      };
    }
  });

  // --- Create workbook
  const workbook: XLSX.WorkBook = {
    Sheets: { Sheet1: worksheet },
    SheetNames: ["Sheet1"]
  };

  // --- Export
  const excelBuffer: any = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  FileSaver.saveAs(blob, `${fileName}.xlsx`);
}


convertToObjects(data: any[][], allHeaders: string[]): any[] {
  return data.map(row => {
    const obj: any = {};
    allHeaders.forEach((key, idx) => {
      obj[key] = row[idx];
    });
    return obj;
  });
}


}

const mathjs = require('mathjs');
// row separator
const CRLF = '\r\n'; // Windows Newline 
const CR = '\r';     // macOS 9 Newline
const LF = '\n';     // Unix/OS X Newline
// cell separator
const TSV_SEPARATOR = '\t';
const CSV_SEPARATOR = ',';
// file name extension 
const TSV_FILE = 'tsv';
const FIX_DECIMAL = 3; // format decimal number

/* 
  interface CsvProcessor {
    title: string;
    inputArray: [][];
    ouputArray: [][];
    tableHeader:[]
  }
*/
class CsvProcessor {
  constructor (request) {
    this.title = 'CSV Evaluation Task'; 
    request.app.locals.fileExtension = getFileExtension(request.file.originalname) || "txt";
    this.inputArray = csvTo2DArray(request.file.buffer.toString(), request.app.locals.fileExtension);
    this.outputArray = copyAndCalculateArray(this.inputArray);
    this.tableHeader = createTableHeader(this.inputArray);
    request.app.locals.outputBuff  = convertArrayToCSV(this.outputArray) || "";
  }
}

function createTableHeader(inputArray) {
  if (inputArray && inputArray[0]) {
    return inputArray[0].reduce((header, _, iCol) => { header.push(numberToCol(iCol + 1)); return header; }, []);
  }
  else {
    return null;
  }
}

function convertArrayToCSV(outputArray) {
  if (outputArray && outputArray[0]) 
    return outputArray.reduce((acc, row) => acc + row.toString() + CRLF, '');
  else 
    return '';
} 

function copyAndCalculateArray(inputArray) {
  let outputArray;
  if (inputArray && inputArray[0] && inputArray[0].length > 0) {
    let scope = {};
    inputArray[0].forEach((value, index) => scope[numberToCol(index + 1)] = parseFloat(value));

    outputArray = JSON.parse(JSON.stringify(inputArray));
    outputArray.forEach((row, iRow) => {
      if (iRow !== 0) {
        row.forEach((cell, iCol) => {
          if (cell) {
            let num = mathjs.evaluate(cell, scope);
            if (!isNaN(parseFloat(num)) && isFinite(num)) 
              outputArray[iRow][iCol] =  Number.isInteger(num) ? num : num.toFixed(FIX_DECIMAL);
            else
              outputArray[iRow][iCol] = num;
          }         
        });
      }
    });
  }
  return outputArray;
}

function csvTo2DArray(csvString, fileExtension) {
  const rowSeparator = csvString.indexOf(CRLF) > 0 ? CRLF : (csvString.indexOf(CR) > 0 ? CR : LF);
  const cellSeparator = fileExtension === TSV_FILE ? TSV_SEPARATOR : CSV_SEPARATOR;
  let results = [];
  csvString.split(rowSeparator).forEach(row => {
    results.push(row.split(cellSeparator));
  });
  return results;
}

function getFileExtension(filepath) {
  return filepath.split("?")[0].split("#")[0].split('.').pop().toLowerCase();
}

function numberToCol(num) {
  var str = '';
  while (num > 0) {
    [q, r] = [(num - 1) / 26, (num - 1) % 26];
    [num, str] = [Math.floor(q), String.fromCharCode(65 + r) + str];
  }
  return str;
}

module.exports = CsvProcessor;

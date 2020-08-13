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
    let fileExtension = getFileExtension(request.file.originalname) || "txt";
    request.app.locals.fileExtension = fileExtension;
    this.inputArray = csvTo2DArray(request.file.buffer.toString(), fileExtension);
    this.outputArray = copyAndCalculateArray(this.inputArray);
    let outBufffer = convertArrayToCSV(this.outputArray)
    request.app.locals.outputBuff = outBufffer || "";
    this.tableHeader = createTableHeader(this.inputArray);
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
  return outputArray.reduce((acc, row) => acc + row.toString() + CRLF, '');
}

function copyAndCalculateArray(inputArray) {
  let scope = {};
  let outputArray = [];
  if (inputArray.length > 0) {
    let scopeRow = inputArray[0];
    scopeRow.forEach((value, index) => {
      scope[numberToCol(index + 1)] = parseFloat(value);
    });
    outputArray = JSON.parse(JSON.stringify(inputArray));
    outputArray.forEach((row, iRow) => {
      if (iRow != 0) {
        row.forEach((cell, iCol) => {
          let num = mathjs.evaluate(cell, scope);
          outputArray[iRow][iCol] =  Number.isInteger(num) ? num : num.toFixed(FIX_DECIMAL);
        });
      }
    });
  }
  return outputArray;
}

function csvTo2DArray(csvString, fileExtension) {
  const rowSeparator = csvString.indexOf(CRLF) > 0 ? CRLF : (csvString.indexOf(CR) > 0 ? CR : LF);
  const cellSeparator = fileExtension === TSV_FILE ? TSV_SEPARATOR : CSV_SEPARATOR;
  const rows = csvString.split(rowSeparator);
  let results = [];
  rows.forEach(row => {
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
    let [q, r] = [(num - 1) / 26, (num - 1) % 26];
    num = Math.floor(q);
    str = String.fromCharCode(65 + r) + str;
  }
  return str;
}

module.exports = CsvProcessor;

const fs = require('fs');
const path = require('path');

function csvToJson(csvFilePath, jsonFilePath) {
    try {
        const csvData = fs.readFileSync(csvFilePath, 'utf8');
        
        if (csvData.trim() === '') {
            throw new Error('CSV file is empty');
        }
        
        const rows = parseCSV(csvData);
        
        if (rows.length === 0) {
            throw new Error('No valid rows found in CSV');
        }
        
        const headers = rows[0];
        const jsonArray = [];
        
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            const record = {};
            
            // Create object with header keys and corresponding values
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                const value = values[j] || '';
                
                // Convert numeric values if they are numbers
                if (header === 'Consumption' || header === 'Nobel') {
                    const numValue = parseFloat(value);
                    record[header] = isNaN(numValue) ? value : numValue;
                } else {
                    record[header] = value;
                }
            }
            
            jsonArray.push(record);
        }
        
        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArray, null, 2));
        console.log(`✅ Successfully converted ${csvFilePath} to ${jsonFilePath}`);
        console.log(`📊 Converted ${jsonArray.length} records`);
        
    } catch (error) {
        console.error(`❌ Error converting CSV to JSON: ${error.message}`);
    }
}

function parseCSV(csvData) {
    const rows = [];
    const lines = csvData.split('\n');
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < lines.length) {
        const line = lines[i];
        let j = 0;
        
        while (j < line.length) {
            const char = line[j];
            
            if (char === '"') {
                if (inQuotes && j + 1 < line.length && line[j + 1] === '"') {
                    currentField += '"';
                    j += 2;
                } else {
                    inQuotes = !inQuotes;
                    j++;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentField.trim());
                currentField = '';
                j++;
            } else {
                currentField += char;
                j++;
            }
        }
        
        if (inQuotes) {
            currentField += '\n';
            i++;
        } else {
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            i++;
        }
    }
    
    if (currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }
    
    return rows;
}

csvToJson(path.join(__dirname, 'data.csv'), path.join(__dirname, 'data.json'));
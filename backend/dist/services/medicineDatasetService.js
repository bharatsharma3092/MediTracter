"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
exports.search = search;
exports.getStatus = getStatus;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const CSV_URL = 'https://raw.githubusercontent.com/junioralive/Indian-Medicine-Dataset/main/DATA/indian_medicine_data.csv';
const DATA_DIR = node_path_1.default.join(__dirname, '..', '..', 'data');
const CSV_PATH = node_path_1.default.join(DATA_DIR, 'indian_medicine_data.csv');
let medicines = [];
let status = 'idle';
let errorMsg = null;
let initPromise = null;
// Parse CSV content line by line. Respects double quotes for compositions
function parseCSV(content) {
    const lines = content.split(/\r?\n/);
    const results = [];
    if (lines.length === 0)
        return results;
    // Skip header: id,name,price(₹),Is_discontinued,manufacturer_name,type,pack_size_label,short_composition1,short_composition2
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line)
            continue;
        const fields = [];
        let currentField = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                fields.push(currentField.trim());
                currentField = '';
            }
            else {
                currentField += char;
            }
        }
        fields.push(currentField.trim());
        if (fields.length >= 2) {
            const name = fields[1] || '';
            const type = fields[5] || '';
            const comp1 = fields[7] || '';
            const comp2 = fields[8] || '';
            let generic = comp1;
            if (comp2) {
                generic += (generic ? ' + ' : '') + comp2;
            }
            results.push({
                name,
                generic,
                category: type || 'Medicine'
            });
        }
    }
    return results;
}
async function downloadDataset() {
    console.log('[medicineDatasetService] Downloading dataset from GitHub...');
    const response = await fetch(CSV_URL);
    if (!response.ok) {
        throw new Error(`Failed to download dataset. HTTP status ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    node_fs_1.default.writeFileSync(CSV_PATH, Buffer.from(buffer));
    console.log(`[medicineDatasetService] Successfully downloaded dataset: ${buffer.byteLength} bytes`);
}
async function initialize() {
    if (initPromise)
        return initPromise;
    initPromise = (async () => {
        try {
            if (!node_fs_1.default.existsSync(DATA_DIR)) {
                node_fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (!node_fs_1.default.existsSync(CSV_PATH)) {
                status = 'downloading';
                await downloadDataset();
            }
            status = 'parsing';
            console.log('[medicineDatasetService] Parsing dataset into memory...');
            const startParse = Date.now();
            const content = node_fs_1.default.readFileSync(CSV_PATH, 'utf8');
            medicines = parseCSV(content);
            status = 'ready';
            console.log(`[medicineDatasetService] Ready! Loaded ${medicines.length} medicines in ${Date.now() - startParse}ms`);
        }
        catch (err) {
            status = 'error';
            errorMsg = err.message || 'Unknown initialization error';
            console.error('[medicineDatasetService] Initialization failed:', err);
            throw err;
        }
    })();
    return initPromise;
}
async function search(query) {
    // Ensure service is initialized (wait if downloading/parsing)
    if (status === 'idle') {
        // Start initialization asynchronously but block search until ready
        initialize().catch(() => { });
    }
    if (initPromise) {
        try {
            await initPromise;
        }
        catch {
            // Fallback if initialization errored
            return [];
        }
    }
    if (status !== 'ready') {
        return [];
    }
    const q = query.toLowerCase().trim();
    if (!q)
        return [];
    const results = [];
    for (let i = 0; i < medicines.length; i++) {
        const med = medicines[i];
        if (med.name.toLowerCase().includes(q) || med.generic.toLowerCase().includes(q)) {
            results.push(med);
            if (results.length >= 10)
                break;
        }
    }
    return results;
}
function getStatus() {
    return {
        status,
        errorMsg,
        loadedCount: medicines.length
    };
}

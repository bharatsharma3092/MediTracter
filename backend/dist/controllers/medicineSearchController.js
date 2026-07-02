"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicineSearchController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const medicineDatasetService_1 = require("../services/medicineDatasetService");
exports.medicineSearchController = {
    async search(req, res) {
        const q = String(req.query.q || '').trim();
        if (q.length < 2) {
            return (0, responseHelper_1.success)(res, []);
        }
        try {
            const results = await (0, medicineDatasetService_1.search)(q);
            return (0, responseHelper_1.success)(res, results);
        }
        catch {
            // In case of any error, gracefully return empty results
            return (0, responseHelper_1.success)(res, []);
        }
    }
};

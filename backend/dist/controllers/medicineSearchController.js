"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicineSearchController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const OPENFDA_URL = 'https://api.fda.gov/drug/label.json';
exports.medicineSearchController = {
    async search(req, res) {
        const q = String(req.query.q || '').trim();
        if (q.length < 2) {
            return (0, responseHelper_1.success)(res, []);
        }
        try {
            const searchQuery = `openfda.brand_name:"${q}"+openfda.generic_name:"${q}"`;
            const url = `${OPENFDA_URL}?search=${encodeURIComponent(searchQuery)}&limit=10`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            if (!response.ok) {
                return (0, responseHelper_1.success)(res, []);
            }
            const data = await response.json();
            const results = [];
            const seen = new Set();
            for (const item of (data.results || [])) {
                const openfda = item.openfda;
                if (!openfda)
                    continue;
                const brands = openfda.brand_name || [];
                const generics = openfda.generic_name || [];
                const substances = openfda.substance_name || [];
                const routes = openfda.route || [];
                const genericName = generics[0] || substances[0] || '';
                const category = routes[0] || 'Medicine';
                for (const brand of brands) {
                    const key = brand.toLowerCase();
                    if (!seen.has(key)) {
                        seen.add(key);
                        results.push({ name: brand, generic: genericName, category });
                    }
                }
                // Also add generic name if not already present
                if (genericName && !seen.has(genericName.toLowerCase())) {
                    seen.add(genericName.toLowerCase());
                    results.push({ name: genericName, generic: genericName, category });
                }
            }
            return (0, responseHelper_1.success)(res, results.slice(0, 8));
        }
        catch {
            // API timeout or network error — return empty results gracefully
            return (0, responseHelper_1.success)(res, []);
        }
    }
};

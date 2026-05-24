"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const reorderService_1 = require("../services/reorderService");
const memoryStore_1 = require("../services/memoryStore");
const pdfService_1 = require("../services/pdfService");
const responseHelper_1 = require("../utils/responseHelper");
exports.reportController = {
    reorder(req, res) {
        const items = (0, memoryStore_1.getItems)(req.user.id);
        const logs = (0, memoryStore_1.getLogs)(req.user.id);
        const rows = items
            .map((item) => {
            const calc = (0, reorderService_1.calculateReorder)(item, logs.filter((log) => log.itemId === item.id), memoryStore_1.settings);
            return {
                itemId: item.id,
                itemName: item.name,
                category: item.category,
                currentStock: item.currentQty,
                qtyToOrder: calc.suggestedReorderQty,
                unit: item.unit,
                expiryDate: item.expiryDate,
                notes: item.notes,
                consumptionRate: calc.consumptionRate,
                daysOfStockLeft: calc.daysOfStockLeft
            };
        })
            .filter((row) => row.qtyToOrder > 0);
        const report = { id: (0, memoryStore_1.id)('reorder'), userId: req.user.id, generatedAt: new Date().toISOString(), items: rows, status: 'draft' };
        memoryStore_1.reorderLists.push(report);
        return (0, responseHelper_1.success)(res, report);
    },
    inventory(req, res) {
        const items = (0, memoryStore_1.getItems)(req.user.id);
        const logs = (0, memoryStore_1.getLogs)(req.user.id);
        const rows = items.map((item) => {
            const rate = (0, reorderService_1.consumptionRate)(logs.filter((log) => log.itemId === item.id), 30);
            return {
                ...item,
                lastUpdated: item.updatedAt,
                consumptionLast30Days: rate * 30,
                daysOfStockRemaining: rate > 0 ? item.currentQty / rate : null
            };
        });
        return (0, responseHelper_1.success)(res, {
            generatedAt: new Date().toISOString(),
            items: rows,
            totalItems: rows.length,
            lowStockCount: rows.filter((item) => item.currentQty < item.minQty).length,
            expiringCount: rows.filter((item) => item.expiryDate && new Date(item.expiryDate).getTime() - Date.now() <= 30 * 86400000).length
        });
    },
    history(req, res) {
        return (0, responseHelper_1.success)(res, memoryStore_1.reorderLists.filter((report) => report.userId === req.user.id));
    },
    getPdf(req, res) {
        res.setHeader('content-type', 'application/pdf');
        res.send((0, pdfService_1.simplePdfBuffer)(`MediTrack report ${req.params.id}`));
    }
};

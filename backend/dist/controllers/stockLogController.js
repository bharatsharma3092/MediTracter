"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockLogController = void 0;
const zod_1 = require("zod");
const alertService_1 = require("../services/alertService");
const memoryStore_1 = require("../services/memoryStore");
const responseHelper_1 = require("../utils/responseHelper");
const stockLogSchema = zod_1.z.object({
    itemId: zod_1.z.string(),
    qtyChange: zod_1.z.coerce.number().positive(),
    logType: zod_1.z.enum(['INTAKE', 'CONSUMPTION', 'EXPIRED', 'DISCARDED']),
    notes: zod_1.z.string().nullable().optional()
});
exports.stockLogController = {
    list(req, res) {
        const item = (0, memoryStore_1.getItems)(req.user.id).find((entry) => entry.id === req.params.itemId);
        if (!item)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        return (0, responseHelper_1.success)(res, (0, memoryStore_1.getLogs)(req.user.id).filter((log) => log.itemId === item.id));
    },
    create(req, res) {
        const input = stockLogSchema.parse(req.body);
        const item = (0, memoryStore_1.getItems)(req.user.id).find((entry) => entry.id === input.itemId);
        if (!item)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        const qtyChange = (0, memoryStore_1.signedQty)(input.logType, input.qtyChange);
        const log = { id: (0, memoryStore_1.id)('log'), itemId: item.id, date: new Date().toISOString(), qtyChange, logType: input.logType, notes: input.notes ?? null };
        (0, memoryStore_1.getLogs)(req.user.id).push(log);
        item.currentQty = Math.max(0, item.currentQty + qtyChange);
        item.updatedAt = new Date().toISOString();
        (0, alertService_1.evaluateItem)(item);
        return (0, responseHelper_1.success)(res, log, 'Stock log created', 201);
    },
    remove(req, res) {
        const logs = (0, memoryStore_1.getLogs)(req.user.id);
        const index = logs.findIndex((log) => log.id === req.params.id);
        if (index < 0)
            return (0, responseHelper_1.failure)(res, 'Stock log not found', 404);
        const log = logs[index];
        const item = (0, memoryStore_1.getItems)(req.user.id).find((entry) => entry.id === log.itemId);
        if (!item)
            return (0, responseHelper_1.failure)(res, 'Item not found', 404);
        item.currentQty = Math.max(0, item.currentQty - log.qtyChange);
        item.updatedAt = new Date().toISOString();
        logs.splice(index, 1);
        (0, alertService_1.evaluateItem)(item);
        return (0, responseHelper_1.success)(res, { id: req.params.id }, 'Stock log deleted');
    }
};
